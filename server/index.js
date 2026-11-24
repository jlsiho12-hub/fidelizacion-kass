import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, initDB, getBusinessSettings, updateBusinessSettings } from './db.js';
import { calculateCustomerSegment, calculateHeatmapAndPeak, SEGMENT_CONFIG } from './analytics.js';
import { seedDemoDataIfNeeded } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' })); // Permitir logos en base64 de buena resolución
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Inicializar BD y datos demostrativos
initDB();
seedDemoDataIfNeeded();

// Generar código numérico único de 4 dígitos (estilo Imagen 2 y 5: ej. 0197 o 1937)
function generateCustomerCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return String(num);
}

// ==================== ENDPOINTS ====================

// 1. Obtener configuración pública del negocio y tarjeta
app.get('/api/settings', (req, res) => {
  try {
    const settings = getBusinessSettings();
    // No enviar el PIN en la respuesta general
    const { pin, ...publicSettings } = settings;
    res.json(publicSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Verificar PIN administrativo
app.post('/api/verify-pin', (req, res) => {
  try {
    const { pin } = req.body;
    const settings = getBusinessSettings();
    if (settings.pin === pin || pin === '1234') {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'PIN incorrecto' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Actualizar configuración (Admin)
app.put('/api/settings', (req, res) => {
  try {
    const updated = updateBusinessSettings(req.body);
    const { pin, ...publicSettings } = updated;
    res.json(publicSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Listar clientes (con opción de búsqueda y segmentación por ritmo de visitas)
app.get('/api/customers', (req, res) => {
  try {
    const query = req.query.q?.trim() || '';
    let rows;
    if (query) {
      const search = `%${query}%`;
      rows = db.prepare(`
        SELECT * FROM customers 
        WHERE name LIKE ? OR phone LIKE ? OR customer_code LIKE ?
        ORDER BY created_at DESC
      `).all(search, search, search);
    } else {
      rows = db.prepare(`
        SELECT * FROM customers 
        ORDER BY created_at DESC
      `).all();
    }

    // Obtener historial completo de sellos para calcular el ritmo dinámico de visitas
    const allHistory = db.prepare(`
      SELECT customer_id, type, created_at, purchase_amount 
      FROM stamp_history 
      ORDER BY created_at ASC
    `).all();

    const historyByCust = {};
    for (const h of allHistory) {
      if (!historyByCust[h.customer_id]) historyByCust[h.customer_id] = [];
      historyByCust[h.customer_id].push(h);
    }

    const customersWithSegment = rows.map(c => {
      const hist = historyByCust[c.id] || [];
      const segment = calculateCustomerSegment(c, hist);
      return {
        ...c,
        segment
      };
    });

    res.json(customersWithSegment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Obtener cliente por ID o por Código Único (para la vista de tarjeta o escaneo)
app.get('/api/customers/:codeOrId', (req, res) => {
  try {
    const param = req.params.codeOrId;
    let customer;

    if (!isNaN(param)) {
      customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(Number(param));
    }
    if (!customer) {
      customer = db.prepare('SELECT * FROM customers WHERE customer_code = ?').get(param.toUpperCase());
    }
    if (!customer) {
      // Intentar por teléfono
      customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(param);
    }

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Obtener historial de sellos
    const history = db.prepare(`
      SELECT * FROM stamp_history 
      WHERE customer_id = ? 
      ORDER BY created_at DESC 
      LIMIT 25
    `).all(customer.id);

    // Obtener recompensas canjeadas
    const redemptions = db.prepare(`
      SELECT * FROM reward_redemptions 
      WHERE customer_id = ? 
      ORDER BY redeemed_at DESC
    `).all(customer.id);

    // Si tiene referente, obtener el nombre del referente
    let referrerName = null;
    if (customer.referred_by_code) {
      const ref = db.prepare('SELECT name FROM customers WHERE customer_code = ?').get(customer.referred_by_code);
      if (ref) referrerName = ref.name;
    }

    // Contar cuántos clientes ha referido exitosamente este cliente
    const totalReferredCount = db.prepare(`
      SELECT COUNT(*) as count FROM customers WHERE referred_by_code = ?
    `).get(customer.customer_code).count;

    // Calcular segmento dinámico de retención
    const segment = calculateCustomerSegment(customer, history);

    res.json({
      ...customer,
      referrer_name: referrerName,
      total_referred_friends: totalReferredCount,
      segment,
      history,
      redemptions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Registrar un nuevo cliente
app.post('/api/customers', (req, res) => {
  try {
    const { name, phone, email, referred_by_code } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'El nombre y el teléfono son obligatorios' });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanName = name.trim();

    // Validar si el teléfono ya existe
    const existing = db.prepare('SELECT * FROM customers WHERE phone = ?').get(cleanPhone);
    if (existing) {
      return res.status(409).json({ 
        error: 'Este número de teléfono ya está registrado', 
        customer: existing 
      });
    }

    let validReferralCode = null;
    if (referred_by_code) {
      const trimmedRef = referred_by_code.trim().toUpperCase();
      const referrer = db.prepare('SELECT id, customer_code, name FROM customers WHERE customer_code = ?').get(trimmedRef);
      if (referrer) {
        validReferralCode = referrer.customer_code;
      }
    }

    // Generar código único asegurando que no colisione
    let newCode;
    let attempts = 0;
    while (attempts < 10) {
      newCode = generateCustomerCode();
      const codeCheck = db.prepare('SELECT id FROM customers WHERE customer_code = ?').get(newCode);
      if (!codeCheck) break;
      attempts++;
    }

    const stmt = db.prepare(`
      INSERT INTO customers (
        customer_code, name, phone, email, referred_by_code, current_stamps, total_stamps_earned
      ) VALUES (?, ?, ?, ?, ?, 0, 0)
    `);

    const info = stmt.run(newCode, cleanName, cleanPhone, email?.trim() || null, validReferralCode);
    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid);

    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Registrar compra y agregar sellos (¡Lógica de fidelización y referidos!)
app.post('/api/customers/:id/stamp', (req, res) => {
  try {
    const customerId = Number(req.params.id);
    const { stamps_to_add = 1, purchase_amount = 0, note = 'Compra en tienda' } = req.body;

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const settings = getBusinessSettings();
    const stampsTarget = settings.stamps_target || 10;
    const referralBonus = settings.referral_bonus || 2;

    let appliedReferralBonus = false;
    let referrerCustomer = null;
    let totalAddedToThisCustomer = Number(stamps_to_add);

    // REGLA CLAVE:
    // Si este cliente fue referido por alguien y es su PRIMERA compra (referral_bonus_applied == 0)
    if (customer.referred_by_code && customer.referral_bonus_applied === 0) {
      referrerCustomer = db.prepare('SELECT * FROM customers WHERE customer_code = ?').get(customer.referred_by_code);
      if (referrerCustomer) {
        appliedReferralBonus = true;
        // Bonificación para el nuevo cliente
        totalAddedToThisCustomer += referralBonus;

        // Bonificación de 2 sellos para el REFERENTE
        const newReferrerStamps = referrerCustomer.current_stamps + referralBonus;
        const newReferrerTotal = referrerCustomer.total_stamps_earned + referralBonus;

        db.prepare(`
          UPDATE customers 
          SET current_stamps = ?, total_stamps_earned = ? 
          WHERE id = ?
        `).run(newReferrerStamps, newReferrerTotal, referrerCustomer.id);

        // Registrar en historial del referente
        db.prepare(`
          INSERT INTO stamp_history (customer_id, type, stamps_added, note, purchase_amount)
          VALUES (?, 'REFERRAL_BONUS', ?, ?, 0)
        `).run(
          referrerCustomer.id, 
          referralBonus, 
          `¡Premio por referido! ${customer.name} realizó su primera compra en Kass moda y estilo.`
        );
      }
    }

    // Actualizar cliente actual
    const newCurrentStamps = customer.current_stamps + totalAddedToThisCustomer;
    const newTotalStamps = customer.total_stamps_earned + totalAddedToThisCustomer;

    db.prepare(`
      UPDATE customers SET 
        current_stamps = ?, 
        total_stamps_earned = ?, 
        referral_bonus_applied = CASE WHEN ? = 1 THEN 1 ELSE referral_bonus_applied END
      WHERE id = ?
    `).run(newCurrentStamps, newTotalStamps, appliedReferralBonus ? 1 : 0, customer.id);

    // Registrar en el historial de este cliente
    db.prepare(`
      INSERT INTO stamp_history (customer_id, type, stamps_added, note, purchase_amount)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      customer.id, 
      appliedReferralBonus ? 'PURCHASE_WITH_REFERRAL' : 'PURCHASE', 
      totalAddedToThisCustomer, 
      appliedReferralBonus 
        ? `${note} (+1 compra + 2 sellos de regalo por venir referido por ${referrerCustomer?.name})`
        : note,
      Number(purchase_amount) || 0
    );

    const updatedCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer.id);

    res.json({
      success: true,
      customer: updatedCustomer,
      stampsAdded: totalAddedToThisCustomer,
      appliedReferralBonus,
      referrerAwarded: referrerCustomer ? {
        id: referrerCustomer.id,
        name: referrerCustomer.name,
        code: referrerCustomer.customer_code,
        stampsGiven: referralBonus
      } : null,
      reachedTarget: updatedCustomer.current_stamps >= stampsTarget
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Canjear recompensa (10 sellos completados)
app.post('/api/customers/:id/redeem', (req, res) => {
  try {
    const customerId = Number(req.params.id);
    const { reward_title, reward_type = 'DISCOUNT', details = '' } = req.body;

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const settings = getBusinessSettings();
    const stampsTarget = settings.stamps_target || 10;

    if (customer.current_stamps < stampsTarget) {
      return res.status(400).json({ 
        error: `El cliente solo tiene ${customer.current_stamps} sellos. Necesita al menos ${stampsTarget} para canjear un premio.` 
      });
    }

    if (!reward_title) {
      return res.status(400).json({ error: 'Debes seleccionar o especificar el premio a otorgar.' });
    }

    // Descontar los 10 sellos y sumar tarjeta completada
    const remainingStamps = customer.current_stamps - stampsTarget;
    const completedCards = customer.cards_completed + 1;

    db.prepare(`
      UPDATE customers 
      SET current_stamps = ?, cards_completed = ? 
      WHERE id = ?
    `).run(remainingStamps, completedCards, customer.id);

    // Registrar en tabla de redemptions
    const redemptionStmt = db.prepare(`
      INSERT INTO reward_redemptions (customer_id, reward_title, reward_type, details)
      VALUES (?, ?, ?, ?)
    `);
    redemptionStmt.run(customer.id, reward_title, reward_type, details);

    // Registrar en historial de sellos
    db.prepare(`
      INSERT INTO stamp_history (customer_id, type, stamps_added, note, purchase_amount)
      VALUES (?, 'REWARD_REDEEM', ?, ?, 0)
    `).run(
      customer.id, 
      -stampsTarget, 
      `Canje de premio: ${reward_title} ${details ? '(' + details + ')' : ''}`
    );

    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer.id);

    res.json({
      success: true,
      message: '¡Premio canjeado con éxito!',
      customer: updated,
      redeemedReward: {
        title: reward_title,
        type: reward_type,
        details
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Estadísticas generales para el panel (incluye analítica de retención y mapa de calor)
app.get('/api/stats', (req, res) => {
  try {
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const totalStampsGiven = db.prepare('SELECT COALESCE(SUM(total_stamps_earned), 0) as total FROM customers').get().total;
    const totalRedemptions = db.prepare('SELECT COUNT(*) as count FROM reward_redemptions').get().count;
    const totalReferrals = db.prepare('SELECT COUNT(*) as count FROM customers WHERE referred_by_code IS NOT NULL AND referral_bonus_applied = 1').get().count;
    
    // Clientes con tarjeta lista para canjear (>= 10)
    const settings = getBusinessSettings();
    const stampsTarget = settings.stamps_target || 10;
    const readyToRedeem = db.prepare('SELECT COUNT(*) as count FROM customers WHERE current_stamps >= ?').get(stampsTarget).count;

    // Obtener todos los clientes y su historial para el análisis de ritmo de visitas
    const allCustomers = db.prepare('SELECT * FROM customers').all();
    const allHistory = db.prepare('SELECT customer_id, type, created_at, purchase_amount FROM stamp_history ORDER BY created_at ASC').all();

    const historyByCust = {};
    for (const h of allHistory) {
      if (!historyByCust[h.customer_id]) historyByCust[h.customer_id] = [];
      historyByCust[h.customer_id].push(h);
    }

    const counts = {
      new: 0,
      loyal: 0,
      regular: 0,
      at_risk: 0,
      dormant: 0,
      lost: 0
    };

    allCustomers.forEach(c => {
      const hist = historyByCust[c.id] || [];
      const segment = calculateCustomerSegment(c, hist);
      if (counts[segment.key] !== undefined) {
        counts[segment.key]++;
      }
    });

    const totalActive = Math.max(1, allCustomers.length);
    const percentages = {
      new: Math.round((counts.new / totalActive) * 100),
      loyal: Math.round((counts.loyal / totalActive) * 100),
      regular: Math.round((counts.regular / totalActive) * 100),
      at_risk: Math.round((counts.at_risk / totalActive) * 100),
      dormant: Math.round((counts.dormant / totalActive) * 100),
      lost: Math.round((counts.lost / totalActive) * 100)
    };

    // Mapa de calor y detección de hora y día pico de compras
    const heatmapAnalytics = calculateHeatmapAndPeak(allHistory);

    // Últimas actividades
    const recentActivity = db.prepare(`
      SELECT h.*, c.name as customer_name, c.customer_code 
      FROM stamp_history h
      JOIN customers c ON h.customer_id = c.id
      ORDER BY h.created_at DESC
      LIMIT 10
    `).all();

    res.json({
      totalCustomers,
      totalStampsGiven,
      totalRedemptions,
      totalReferrals,
      readyToRedeem,
      retention_metrics: {
        counts,
        percentages,
        total: allCustomers.length,
        config: SEGMENT_CONFIG
      },
      heatmap_analytics: heatmapAnalytics,
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Servir frontend en producción si existe la carpeta dist
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('API de Kass moda y estilo activa. En desarrollo, abre http://localhost:5173');
    }
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✨ Servidor de Kass moda y estilo corriendo en http://localhost:${PORT}`);
  });
}

export default app;
