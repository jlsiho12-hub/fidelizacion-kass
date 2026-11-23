import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'fidelizacion.db');

export const db = new DatabaseSync(dbPath);

// Inicializar tablas
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_settings (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      slogan TEXT,
      logo_url TEXT,
      phone TEXT,
      whatsapp TEXT,
      instagram TEXT,
      address TEXT,
      primary_color TEXT DEFAULT '#831843',
      secondary_color TEXT DEFAULT '#ec4899',
      card_theme TEXT DEFAULT 'elegance-rose',
      card_icon TEXT DEFAULT 'gem',
      sticker_type TEXT DEFAULT 'emoji',
      sticker_emoji TEXT DEFAULT '👗',
      sticker_image_url TEXT DEFAULT '',
      sticker_color TEXT DEFAULT '#db2777',
      card_pattern TEXT DEFAULT 'silk',
      card_border_style TEXT DEFAULT 'gold',
      stamps_target INTEGER DEFAULT 10,
      referral_bonus INTEGER DEFAULT 2,
      rewards_list TEXT,
      terms TEXT,
      pin TEXT DEFAULT '1234'
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      current_stamps INTEGER DEFAULT 0,
      total_stamps_earned INTEGER DEFAULT 0,
      cards_completed INTEGER DEFAULT 0,
      referred_by_code TEXT,
      referral_bonus_applied INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stamp_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      stamps_added INTEGER NOT NULL,
      note TEXT,
      purchase_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS reward_redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      reward_title TEXT NOT NULL,
      reward_type TEXT,
      details TEXT,
      redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `);

  // Migraciones automáticas por si las columnas no existen
  const columnsToAdd = [
    { name: 'sticker_type', type: 'TEXT DEFAULT "emoji"' },
    { name: 'sticker_emoji', type: 'TEXT DEFAULT "👗"' },
    { name: 'sticker_image_url', type: 'TEXT DEFAULT ""' },
    { name: 'sticker_color', type: 'TEXT DEFAULT "#db2777"' },
    { name: 'card_bg_color', type: 'TEXT DEFAULT "#121214"' },
    { name: 'unmarked_stamp_style', type: 'TEXT DEFAULT "dashed_star"' },
    { name: 'card_pattern', type: 'TEXT DEFAULT "silk"' },
    { name: 'card_border_style', type: 'TEXT DEFAULT "gold"' },
    { name: 'card_bg_image', type: 'TEXT DEFAULT ""' },
    { name: 'card_gradient_angle', type: 'INTEGER DEFAULT 145' },
    { name: 'stamp_shape', type: 'TEXT DEFAULT "rounded"' },
    { name: 'unmarked_stamp_bg', type: 'TEXT DEFAULT "rgba(0,0,0,0.4)"' },
    { name: 'unmarked_stamp_border', type: 'TEXT DEFAULT "rgba(255,255,255,0.15)"' },
    { name: 'card_font', type: 'TEXT DEFAULT "serif"' },
    { name: 'card_border_glow', type: 'TEXT DEFAULT "gold"' },
    { name: 'custom_completion_message', type: 'TEXT DEFAULT ""' },
    { name: 'banner_url', type: 'TEXT DEFAULT ""' },
    { name: 'program_name', type: 'TEXT DEFAULT "Programa de Fidelización"' },
    { name: 'reward_description', type: 'TEXT DEFAULT "20% de Descuento o Regalo Especial"' },
    { name: 'how_it_works', type: 'TEXT DEFAULT "Acumula 10 sellos y reclama tu premio en tienda"' },
    { name: 'reward_invitations', type: 'INTEGER DEFAULT 1' },
    { name: 'max_invitations_month', type: 'INTEGER DEFAULT 5' },
    { name: 'conditions', type: 'TEXT DEFAULT "Válido en todas tus compras en tienda física"' },
    { name: 'welcome_title', type: 'TEXT DEFAULT "Bienvenida a Kass moda y estilo"' },
    { name: 'welcome_subtitle', type: 'TEXT DEFAULT "Moda de especialidad y tendencia. Descubre prendas exclusivas y acumula beneficios con cada visita."' },
    { name: 'welcome_btn_text', type: 'TEXT DEFAULT "Entrar / Obtener mi tarjeta"' },
    { name: 'register_title', type: 'TEXT DEFAULT "Registra tu Tarjeta en 10 segundos"' },
    { name: 'register_subtitle', type: 'TEXT DEFAULT "Solo ingresa tu nombre y teléfono. Tu tarjeta quedará guardada en tu celular."' },
    { name: 'register_btn_text', type: 'TEXT DEFAULT "¡Listo! Ver mi tarjeta"' }
  ];

  for (const col of columnsToAdd) {
    try {
      db.exec(`ALTER TABLE business_settings ADD COLUMN ${col.name} ${col.type}`);
    } catch {
      // Ignorar si la columna ya existe
    }
  }

  // Insertar configuración inicial de Casmoda y estilo si no existe
  const checkSettings = db.prepare('SELECT id FROM business_settings WHERE id = 1').get();
  if (!checkSettings) {
    const defaultRewards = JSON.stringify([
      "20% de Descuento en tu próxima prenda",
      "Bono de $30.000 para tu compra",
      "Accesorio o Prenda de Regalo seleccionada",
      "Regalo Especial de Temporada Kass Moda"
    ]);

    const defaultTerms = "1. Presenta tu tarjeta digital o código QR antes de pagar.\n2. Recibes 1 sello por cada compra registrada.\n3. Al compartir tu enlace o código con amigas/os, ambos reciben 2 sellos de regalo cuando realicen su primera compra.\n4. Al completar 10 sellos puedes elegir tu recompensa en tienda.\n5. Las recompensas no son acumulables con otras promociones.";

    const insertInitial = db.prepare(`
      INSERT INTO business_settings (
        id, name, slogan, logo_url, phone, whatsapp, instagram, address,
        primary_color, secondary_color, card_theme, card_icon,
        stamps_target, referral_bonus, rewards_list, terms, pin
      ) VALUES (
        1, 'Kass moda y estilo', 'Moda, elegancia y tendencia para ti',
        '', '+57 300 000 0000', '+57 300 000 0000', '@kassmodayestilo', 'Centro Comercial / Calle Principal',
        '#831843', '#ec4899', 'elegance-rose', 'gem',
        10, 2, ?, ?, '1234'
      )
    `);
    insertInitial.run(defaultRewards, defaultTerms);
  }
}

// Helpers para consultar settings
export function getBusinessSettings() {
  const row = db.prepare('SELECT * FROM business_settings WHERE id = 1').get();
  if (row && row.rewards_list) {
    try {
      row.rewards_list = JSON.parse(row.rewards_list);
    } catch {
      row.rewards_list = [];
    }
  }
  return row;
}

export function updateBusinessSettings(data) {
  const rewardsJson = Array.isArray(data.rewards_list) 
    ? JSON.stringify(data.rewards_list) 
    : data.rewards_list;

  const stmt = db.prepare(`
    UPDATE business_settings SET
      name = COALESCE(?, name),
      slogan = COALESCE(?, slogan),
      logo_url = COALESCE(?, logo_url),
      phone = COALESCE(?, phone),
      whatsapp = COALESCE(?, whatsapp),
      instagram = COALESCE(?, instagram),
      address = COALESCE(?, address),
      primary_color = COALESCE(?, primary_color),
      secondary_color = COALESCE(?, secondary_color),
      card_theme = COALESCE(?, card_theme),
      card_icon = COALESCE(?, card_icon),
      sticker_type = COALESCE(?, sticker_type),
      sticker_emoji = COALESCE(?, sticker_emoji),
      sticker_image_url = COALESCE(?, sticker_image_url),
      sticker_color = COALESCE(?, sticker_color),
      card_bg_color = COALESCE(?, card_bg_color),
      unmarked_stamp_style = COALESCE(?, unmarked_stamp_style),
      card_pattern = COALESCE(?, card_pattern),
      card_border_style = COALESCE(?, card_border_style),
      card_bg_image = COALESCE(?, card_bg_image),
      card_gradient_angle = COALESCE(?, card_gradient_angle),
      stamp_shape = COALESCE(?, stamp_shape),
      unmarked_stamp_bg = COALESCE(?, unmarked_stamp_bg),
      unmarked_stamp_border = COALESCE(?, unmarked_stamp_border),
      card_font = COALESCE(?, card_font),
      card_border_glow = COALESCE(?, card_border_glow),
      custom_completion_message = COALESCE(?, custom_completion_message),
      banner_url = COALESCE(?, banner_url),
      program_name = COALESCE(?, program_name),
      reward_description = COALESCE(?, reward_description),
      how_it_works = COALESCE(?, how_it_works),
      reward_invitations = COALESCE(?, reward_invitations),
      max_invitations_month = COALESCE(?, max_invitations_month),
      conditions = COALESCE(?, conditions),
      welcome_title = COALESCE(?, welcome_title),
      welcome_subtitle = COALESCE(?, welcome_subtitle),
      welcome_btn_text = COALESCE(?, welcome_btn_text),
      register_title = COALESCE(?, register_title),
      register_subtitle = COALESCE(?, register_subtitle),
      register_btn_text = COALESCE(?, register_btn_text),
      stamps_target = COALESCE(?, stamps_target),
      referral_bonus = COALESCE(?, referral_bonus),
      rewards_list = COALESCE(?, rewards_list),
      terms = COALESCE(?, terms),
      pin = COALESCE(?, pin)
    WHERE id = 1
  `);

  stmt.run(
    data.name, data.slogan, data.logo_url, data.phone, data.whatsapp,
    data.instagram, data.address, data.primary_color, data.secondary_color,
    data.card_theme, data.card_icon,
    data.sticker_type, data.sticker_emoji, data.sticker_image_url,
    data.sticker_color, data.card_bg_color, data.unmarked_stamp_style,
    data.card_pattern, data.card_border_style,
    data.card_bg_image, data.card_gradient_angle, data.stamp_shape,
    data.unmarked_stamp_bg, data.unmarked_stamp_border,
    data.card_font, data.card_border_glow, data.custom_completion_message,
    data.banner_url, data.program_name, data.reward_description,
    data.how_it_works, data.reward_invitations, data.max_invitations_month,
    data.conditions,
    data.welcome_title, data.welcome_subtitle, data.welcome_btn_text,
    data.register_title, data.register_subtitle, data.register_btn_text,
    data.stamps_target, data.referral_bonus,
    rewardsJson, data.terms, data.pin
  );

  return getBusinessSettings();
}
