// ════════════════════════════════════════════════════════════
// MI CUENTA ISPI · Node + Express + Supabase (API REST directa)
// Esquema del TP:
//   alumnos(id, dni, nombre, apellido, carrera, curso)
//   cuotas(id, alumno_id, concepto, vencimiento, importe, pagado)
// ════════════════════════════════════════════════════════════
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Config Supabase (limpia comillas/espacios del .env) ── */
const clean = v => (v || '').trim().replace(/^["']+|["']+$/g, '').replace(/\/$/, '');
const SB_URL = clean(process.env.SUPABASE_URL);
const SB_KEY = clean(process.env.SUPABASE_ANON_KEY);

let OK = false;
try { new URL(SB_URL); OK = !!(SB_URL && SB_KEY && SB_KEY.length > 20); }
catch (e) { console.error('⚠ SUPABASE_URL inválida →', e.message); }

const DEMO = !OK;
const HEADERS = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

/* ─ Prueba de conexión al arrancar ─ */
if (OK) {
  (async () => {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/alumnos?select=id&limit=1`, { headers: HEADERS });
      if (r.ok) console.log('✔ Prueba de lectura en Supabase OK');
      else console.error('⚠ Prueba falló → HTTP', r.status);
    } catch (e) { console.error('⚠ Prueba falló →', e.message); }
  })();
}

/* ── Datos demo (solo si no hay Supabase configurado) ── */
const DB = {
  alumnos: [
    { id:'a1', dni:'34567890', nombre:'Juan', apellido:'Pérez', carrera:'Técnico Superior en Desarrollo de Software', curso:'2° año' },
    { id:'a2', dni:'35214879', nombre:'Marcos', apellido:'Ledante', carrera:'Técnico Superior en Administración', curso:'3° año' },
    { id:'a3', dni:'38990441', nombre:'Sofía', apellido:'Vidal', carrera:'Enfermería Profesional', curso:'1° año' }
  ],
  cuotas: [
    { id:101, alumno_id:'a1', nro_cuota:0, concepto:'Pago de matrícula', monto:60000, vencimiento:'2026-03-05', pagado:true,  fecha_pago:'2026-03-01' },
    { id:102, alumno_id:'a1', nro_cuota:1, concepto:'Cuota mensual', monto:45000, vencimiento:'2026-03-10', pagado:true,  fecha_pago:'2026-03-09' },
    { id:103, alumno_id:'a1', nro_cuota:2, concepto:'Cuota mensual', monto:45000, vencimiento:'2026-04-10', pagado:true,  fecha_pago:'2026-04-08' },
    { id:104, alumno_id:'a1', nro_cuota:3, concepto:'Cuota mensual', monto:45000, vencimiento:'2026-05-10', pagado:true,  fecha_pago:'2026-05-12' },
    { id:105, alumno_id:'a1', nro_cuota:4, concepto:'Cuota mensual', monto:45000, vencimiento:'2026-06-10', pagado:true,  fecha_pago:'2026-06-09' },
    { id:106, alumno_id:'a1', nro_cuota:5, concepto:'Cuota mensual', monto:45000, vencimiento:'2026-07-10', pagado:false, fecha_pago:null },
    { id:107, alumno_id:'a1', nro_cuota:6, concepto:'Cuota mensual', monto:45000, vencimiento:'2026-08-20', pagado:false, fecha_pago:null },
    { id:108, alumno_id:'a1', nro_cuota:7, concepto:'Cuota mensual', monto:48000, vencimiento:'2026-09-10', pagado:false, fecha_pago:null },
    { id:201, alumno_id:'a2', nro_cuota:0, concepto:'Pago de matrícula', monto:60000, vencimiento:'2026-03-05', pagado:true,  fecha_pago:'2026-03-03' },
    { id:202, alumno_id:'a2', nro_cuota:1, concepto:'Cuota mensual', monto:47000, vencimiento:'2026-03-10', pagado:true,  fecha_pago:'2026-03-10' },
    { id:203, alumno_id:'a2', nro_cuota:2, concepto:'Cuota mensual', monto:47000, vencimiento:'2026-04-10', pagado:true,  fecha_pago:'2026-04-15' },
    { id:204, alumno_id:'a2', nro_cuota:3, concepto:'Cuota mensual', monto:47000, vencimiento:'2026-05-10', pagado:true,  fecha_pago:'2026-05-09' },
    { id:205, alumno_id:'a2', nro_cuota:4, concepto:'Cuota mensual', monto:47000, vencimiento:'2026-06-10', pagado:false, fecha_pago:null },
    { id:206, alumno_id:'a2', nro_cuota:5, concepto:'Cuota mensual', monto:47000, vencimiento:'2026-07-10', pagado:false, fecha_pago:null },
    { id:207, alumno_id:'a2', nro_cuota:6, concepto:'Cuota mensual', monto:47000, vencimiento:'2026-08-25', pagado:false, fecha_pago:null },
    { id:301, alumno_id:'a3', nro_cuota:0, concepto:'Pago de matrícula', monto:62000, vencimiento:'2026-03-05', pagado:true,  fecha_pago:'2026-02-27' },
    { id:302, alumno_id:'a3', nro_cuota:1, concepto:'Cuota mensual', monto:46000, vencimiento:'2026-03-10', pagado:true,  fecha_pago:'2026-03-06' },
    { id:303, alumno_id:'a3', nro_cuota:2, concepto:'Cuota mensual', monto:46000, vencimiento:'2026-04-10', pagado:true,  fecha_pago:'2026-04-09' },
    { id:304, alumno_id:'a3', nro_cuota:3, concepto:'Cuota mensual', monto:46000, vencimiento:'2026-05-10', pagado:true,  fecha_pago:'2026-05-08' },
    { id:305, alumno_id:'a3', nro_cuota:4, concepto:'Cuota mensual', monto:46000, vencimiento:'2026-06-10', pagado:true,  fecha_pago:'2026-06-10' },
    { id:306, alumno_id:'a3', nro_cuota:5, concepto:'Cuota mensual', monto:46000, vencimiento:'2026-07-10', pagado:true,  fecha_pago:'2026-07-07' },
    { id:307, alumno_id:'a3', nro_cuota:6, concepto:'Cuota mensual', monto:46000, vencimiento:'2026-08-10', pagado:true,  fecha_pago:'2026-08-08' },
    { id:308, alumno_id:'a3', nro_cuota:7, concepto:'Cuota mensual', monto:49000, vencimiento:'2026-09-10', pagado:false, fecha_pago:null }
  ]
};

/* ── Lógica de estados ── */
const hoy0 = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const esPagado = v => v === true || v === 'true' || v === 'si' || v === 'sí' || v === 1 || v === '1' || v === 't';
const estadoDe = c => esPagado(c.pagado) ? 'paga'
  : (new Date(c.vencimiento + 'T00:00:00') < hoy0() ? 'vencida' : 'pendiente');

/* Normaliza una fila de TU tabla cuotas al formato interno de la app */
const normCuota = c => ({
  id: c.id,
  alumno_id: c.alumno_id,
  nro_cuota: c.nro_cuota ?? null,
  concepto: c.concepto || 'Cuota mensual',
  monto: Number(c.importe ?? c.monto ?? 0),
  vencimiento: c.vencimiento,
  pagado: c.pagado,
  fecha_pago: c.fecha_pago || (esPagado(c.pagado) ? c.vencimiento : null),
  estado: estadoDe(c)
});

async function pgGet(ruta){
  const url = `${SB_URL}/rest/v1/${ruta}`;
  const r = await fetch(url, { headers: HEADERS });
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${body?.message || body?.error || 'Unknown'}`);
  return body;
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => res.json({ demo: DEMO }));

app.get('/api/estado-cuenta', async (req, res) => {
  const dni = (req.query.dni || '').replace(/\D/g, '').slice(0, 8);
  if (dni.length < 7) return res.status(400).json({ error: 'DNI inválido' });
  try {
    let alumno, cuotas;
    if (DEMO) {
      await new Promise(r => setTimeout(r, 350));
      alumno = DB.alumnos.find(a => a.dni === dni) || null;
      cuotas = alumno ? DB.cuotas.filter(c => c.alumno_id === alumno.id).map(normCuota) : [];
    } else {
      const filas = await pgGet(`alumnos?select=*&dni=eq.${encodeURIComponent(dni)}`);
      alumno = filas && filas[0] ? filas[0] : null;
      if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
      const cs = await pgGet(`cuotas?select=*&alumno_id=eq.${alumno.id}&order=vencimiento.asc`);
      cuotas = (cs || []).map(normCuota);
    }
    res.json({ alumno, cuotas, demo: DEMO });
  } catch (e) {
    console.error('ERROR consulta →', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Para Vercel (serverless)
module.exports = app;

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(
    `✔ MI CUENTA ISPI → http://localhost:${PORT} ` +
    (DEMO ? '· MODO DEMO' : `· Supabase (${new URL(SB_URL).hostname})`)));
  }