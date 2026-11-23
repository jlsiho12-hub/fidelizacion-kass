import { db } from './db.js';

export function seedDemoDataIfNeeded() {
  const count = db.prepare('SELECT count(*) as c FROM customers').get().c;
  if (count >= 5) {
    console.log('Base de datos ya cuenta con clientes suficientes.');
    return;
  }

  console.log('Inicializando datos de muestra de clientes y ritmo de visitas...');

  const now = new Date();
  const subDays = (d, days, hours = 16) => {
    const date = new Date(d);
    date.setDate(date.getDate() - days);
    date.setHours(hours, 0, 0, 0);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  // Clientes con distintos perfiles y códigos de 4 dígitos
  const demoCustomers = [
    {
      code: '1937',
      name: 'Valentina Gómez',
      phone: '3105551234',
      email: 'valentina@gmail.com',
      current_stamps: 8,
      total_stamps_earned: 8,
      cards_completed: 0,
      referred_by: null,
      created_days_ago: 60,
      // Fiel: visita frecuentemente cada 7-9 días, última visita hace 3 días
      visits: [55, 47, 40, 31, 22, 12, 3] 
    },
    {
      code: '8821',
      name: 'Camila Restrepo',
      phone: '3124445678',
      email: 'camila.r@outlook.com',
      current_stamps: 10, // ¡Lista para reclamar!
      total_stamps_earned: 10,
      cards_completed: 0,
      referred_by: '1937',
      created_days_ago: 75,
      // Fiel: 6 visitas
      visits: [70, 58, 44, 30, 16, 4]
    },
    {
      code: '4290',
      name: 'Mariana Silva',
      phone: '3153339012',
      email: 'mariana.silva@gmail.com',
      current_stamps: 3,
      total_stamps_earned: 3,
      cards_completed: 0,
      referred_by: null,
      created_days_ago: 35,
      // Regular: 3 visitas cada 10 días, última hace 8 días
      visits: [28, 18, 8]
    },
    {
      code: '5123',
      name: 'Sofía Vargas',
      phone: '3202223456',
      email: 'sofi.v@gmail.com',
      current_stamps: 2,
      total_stamps_earned: 2,
      cards_completed: 0,
      referred_by: null,
      created_days_ago: 25,
      // Regular: 2 visitas
      visits: [20, 10]
    },
    {
      code: '6744',
      name: 'Daniela Morales',
      phone: '3187778901',
      email: 'daniela.m@hotmail.com',
      current_stamps: 1,
      total_stamps_earned: 1,
      cards_completed: 0,
      referred_by: '1937',
      created_days_ago: 5,
      // Nueva: 1 visita hace 4 días
      visits: [4]
    },
    {
      code: '3089',
      name: 'Andrea Peña',
      phone: '3119994321',
      email: 'andrea.pena@gmail.com',
      current_stamps: 4,
      total_stamps_earned: 4,
      cards_completed: 0,
      referred_by: null,
      created_days_ago: 50,
      // Atrasada (En riesgo): venía cada 10 días, pero lleva 18 días sin venir
      visits: [38, 28, 18]
    },
    {
      code: '7412',
      name: 'Laura Sánchez',
      phone: '3168887654',
      email: 'laura.s@gmail.com',
      current_stamps: 3,
      total_stamps_earned: 3,
      cards_completed: 0,
      referred_by: null,
      created_days_ago: 120,
      // Dormida (Inactiva): lleva 72 días sin venir
      visits: [110, 95, 72]
    },
    {
      code: '9031',
      name: 'Carolina Mejía',
      phone: '3141112233',
      email: 'carolina.mejia@gmail.com',
      current_stamps: 1,
      total_stamps_earned: 1,
      cards_completed: 0,
      referred_by: null,
      created_days_ago: 105,
      // No regresó: 1 sola visita hace 98 días
      visits: [98]
    }
  ];

  // Insertar clientes
  for (const c of demoCustomers) {
    const existing = db.prepare('SELECT id FROM customers WHERE phone = ? OR customer_code = ?').get(c.phone, c.code);
    let custId = existing?.id;
    if (!existing) {
      const regDate = subDays(now, c.created_days_ago, 11);
      const info = db.prepare(`
        INSERT INTO customers (
          customer_code, name, phone, email, current_stamps, total_stamps_earned, 
          cards_completed, referred_by_code, referral_bonus_applied, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        c.code, c.name, c.phone, c.email, c.current_stamps, c.total_stamps_earned,
        c.cards_completed, c.referred_by, c.referred_by ? 1 : 0, regDate
      );
      custId = info.lastInsertRowid;
    }

    // Insertar visitas en historial
    for (const vDays of c.visits) {
      // Ajustar horas variadas: 11:00, 15:00, 16:00, 17:00 para simular afluencia en boutique
      const hour = (vDays % 3 === 0) ? 16 : ((vDays % 2 === 0) ? 17 : 14);
      const visitDate = subDays(now, vDays, hour);
      db.prepare(`
        INSERT INTO stamp_history (customer_id, type, stamps_added, note, purchase_amount, created_at)
        VALUES (?, 'PURCHASE', 1, 'Compra de prenda en boutique', 85000, ?)
      `).run(custId, visitDate);
    }
  }

  console.log('Clientes de prueba generados con éxito.');
}
