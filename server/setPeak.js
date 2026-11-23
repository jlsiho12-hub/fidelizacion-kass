import { db } from './db.js';
import { calculateHeatmapAndPeak } from './analytics.js';

db.prepare('DELETE FROM stamp_history WHERE note LIKE ?').run('%sábado de temporada%');

const now = new Date();
const dayOfWeek = now.getDay();
const daysBackToSaturday = (dayOfWeek + 1) % 7 || 7;
const satDate = new Date(now);
satDate.setDate(now.getDate() - daysBackToSaturday);
const pad = n => String(n).padStart(2, '0');
const satStr = `${satDate.getFullYear()}-${pad(satDate.getMonth() + 1)}-${pad(satDate.getDate())} 16:00:00`;

for (let i = 1; i <= 7; i++) {
  db.prepare(`
    INSERT INTO stamp_history (customer_id, type, stamps_added, note, purchase_amount, created_at)
    VALUES (1, 'PURCHASE', 1, 'Compra en sábado de temporada', 95000, ?)
  `).run(satStr);
}

const rows = db.prepare('SELECT type, created_at FROM stamp_history').all();
const res = calculateHeatmapAndPeak(rows);
console.log('Peak is now:', res.peak);
