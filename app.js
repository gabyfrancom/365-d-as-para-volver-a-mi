const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_MES = [31,28,31,30,31,30,31,31,30,31,30,31];
const hoy = new Date();
let mi = hoy.getMonth(), dd = hoy.getDate();
const clave = (m,d) => MESES[m]+'-'+d;
const entrada = (m,d) => BOOK.days.find(x => x.month === MESES[m] && x.day === d);
const $ = id => document.getElementById(id);
const guardado = (m,d) => JSON.parse(localStorage.getItem('entry_'+clave(m,d)) || 'null');
const KEY_HOY = clave(hoy.getMonth(), hoy.getDate());

/* ---------- tema claro / oscuro ---------- */
function aplicarTema(t){
  document.body.classList.toggle('oscuro', t === 'oscuro');
  $('btn-tema').textContent = t === 'oscuro' ? '☀️' : '🌙';
  localStorage.setItem('tema', t);
}
aplicarTema(localStorage.getItem('tema') || 'claro');
$('btn-tema').onclick = () =>
  aplicarTema(document.body.classList.contains('oscuro') ? 'claro' : 'oscuro');

/* ---------- pétalos ---------- */
for (let i=0;i<12;i++){
  const p = document.createElement('div'); p.className = 'petalo';
  p.textContent = '🌸'; p.style.left = (Math.random()*100)+'vw';
  p.style.animationDuration = (10+Math.random()*12)+'s';
  p.style.animationDelay = (Math.random()*12)+'s';
  p.style.fontSize = (12+Math.random()*16)+'px';
  $('petalos').appendChild(p);
}

/* ---------- carga del día ---------- */
function cargarDia(m, d, dir){
  const e = entrada(m,d), s = BOOK.symbols[e.emoji];
  const f = new Date(hoy.getFullYear(), m, d);
  $('emoji-dia').textContent = e.emoji;
  $('titulo-dia').textContent = e.month + ' ' + d;
  $('fecha-larga').textContent = f.toLocaleDateString('es-ES',
    {weekday:'long', day:'numeric', month:'long'});
  $('chip-simbolo').innerHTML = e.emoji + ' ' + (s ? s.name : '');
  $('chip-simbolo').title = s ? s.desc : '';
  const lineas = e.text.split('\n');
  $('invitacion').textContent = lineas.length > 1 ? lineas[lineas.length-1] : '';
  $('reflexion').textContent = (lineas.length > 1 ? lineas.slice(0,-1) : lineas).join('\n');
  const nota = $('mes-nota'), ultimo = DIAS_MES[m];
  let pl = null;
  if (d === 1) pl = BOOK.prologs.find(p => p.month === MESES[m] && p.type === 'Prólogo');
  if (d === ultimo) pl = BOOK.prologs.find(p => p.month === MESES[m] && p.type === 'Epílogo');
  if (pl){
    nota.style.display = 'block';
    nota.innerHTML = '<h3>' + (d === 1 ? 'Prólogo' : 'Epílogo') + ' · ' + MESES[m] + '</h3><p>' + pl.text + '</p>';
  } else nota.style.display = 'none';
  const g = guardado(m,d) || {};
  $('f-emocion').value = g.emocion || '';
  $('f-sensacion').value = g.sensacion || '';
  $('f-libre').value = g.libre || '';
  document.querySelectorAll('#f-energia button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === g.energia));
  const btn = $('btn-guardar');
  btn.textContent = g.completo ? 'Registro guardado ✓' : 'Guardar mi registro 🌸';
  btn.classList.toggle('guardado', !!g.completo);
  const card = $('tarjeta-dia');
  card.classList.remove('animar','des-der','des-izq'); void card.offsetWidth;
  if (dir) card.classList.add(dir > 0 ? 'des-der' : 'des-izq');
  card.classList.add('animar');
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ---------- guardar ---------- */
$('btn-guardar').onclick = () => {
  const g = guardado(mi,dd) || {};
  const nuevo = { emocion: $('f-emocion').value, sensacion: $('f-sensacion').value,
    libre: $('f-libre').value, energia: g.energia, completo: true,
    fecha: new Date().toISOString().slice(0,10) };
  localStorage.setItem('entry_'+clave(mi,dd), JSON.stringify(nuevo));
  $('btn-guardar').textContent = 'Registro guardado ✓';
  $('btn-guardar').classList.add('guardado');
  actualizarInicio();
};
document.querySelectorAll('#f-energia button').forEach(b => b.onclick = () => {
  document.querySelectorAll('#f-energia button').forEach(x => x.classList.remove('sel'));
  b.classList.add('sel');
  const g = guardado(mi,dd) || {}; g.energia = b.dataset.v;
  localStorage.setItem('entry_'+clave(mi,dd), JSON.stringify(g));
});

/* ---------- respiraciones conscientes (6 técnicas) ---------- */
const RESPIRACIONES = [
  { id:'simple', nombre:'Respiración consciente simple', patron:'Inhala 4 · Exhala 4',
    desc:'El equilibrio básico. Calma la mente y te ancla al presente.',
    fases:[{n:'Inhala',d:4},{n:'Exhala',d:4}], ciclos:6 },
  { id:'diafragma', nombre:'Respiración diafragmática', patron:'Inhala 4 · Exhala 6',
    desc:'El vientre se infla al inhalar y se suaviza al exhalar. Relaja profundamente.',
    fases:[{n:'Inhala',d:4},{n:'Exhala',d:6}], ciclos:6 },
  { id:'coherente', nombre:'Respiración coherente', patron:'Inhala 5 · Exhala 5',
    desc:'5-5 equilibra el sistema nervioso y eleva la claridad emocional.',
    fases:[{n:'Inhala',d:5},{n:'Exhala',d:5}], ciclos:8 },
  { id:'caja', nombre:'Respiración cuadrada', patron:'Inhala 4 · Sostén 4 · Exhala 4 · Sostén 4',
    desc:'Usada por los Navy SEALs. Enfoca y estabiliza bajo presión.',
    fases:[{n:'Inhala',d:4},{n:'Sostén',d:4},{n:'Exhala',d:4},{n:'Sostén',d:4}], ciclos:5 },
  { id:'478', nombre:'Respiración 4-7-8', patron:'Inhala 4 · Sostén 7 · Exhala 8',
    desc:'La favorita para conciliar el sueño y soltar la ansiedad.',
    fases:[{n:'Inhala',d:4},{n:'Sostén',d:7},{n:'Exhala',d:8}], ciclos:4 },
  { id:'nadi', nombre:'Respiración alterna (Nadi Shodhana)', patron:'Inhala 4 · Exhala 4 · cambia de fosa',
    desc:'Cierra una fosa nasal con el pulgar y alterna. Equilibra energía y emociones.',
    fases:[{n:'Inhala izquierda',d:4},{n:'Exhala derecha',d:4},
           {n:'Inhala derecha',d:4},{n:'Exhala izquierda',d:4}], ciclos:4 }
];

let respTimer = null, audioCtx = null, tecnicaActual = null;
let sonidoOn = localStorage.getItem('sonidoResp') !== 'off';

function sonidoRespiracion(tipo, dur){
  if (!sonidoOn) return;
  try{
    if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t0 = audioCtx.currentTime, d = Math.max(dur - 0.15, 1);
    const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.type = 'sine';
    if (tipo === 'f-inhala'){ osc.frequency.setValueAtTime(196,t0); osc.frequency.linearRampToValueAtTime(392,t0+d); }
    else if (tipo === 'f-exhala'){ osc.frequency.setValueAtTime(392,t0); osc.frequency.linearRampToValueAtTime(196,t0+d); }
    else { osc.frequency.setValueAtTime(294,t0); }
    g.gain.setValueAtTime(0,t0);
    g.gain.linearRampToValueAtTime(0.10,t0+d*0.3);
    g.gain.linearRampToValueAtTime(0.0001,t0+d);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t0); osc.stop(t0+d+0.05);
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate*d, audioCtx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i=0;i<ch.length;i++) ch[i] = Math.random()*2-1;
    const noise = audioCtx.createBufferSource(); noise.buffer = buf;
    const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.6;
    const base = tipo === 'f-sosten' ? 620 : 420;
    bp.frequency.setValueAtTime(base,t0);
    bp.frequency.linearRampToValueAtTime(tipo === 'f-inhala' ? 880 : base*0.6, t0+d);
    const g2 = audioCtx.createGain();
    g2.gain.setValueAtTime(0,t0);
    g2.gain.linearRampToValueAtTime(0.04,t0+d*0.4);
    g2.gain.linearRampToValueAtTime(0.0001,t0+d);
    noise.connect(bp).connect(g2).connect(audioCtx.destination);
    noise.start(t0); noise.stop(t0+d+0.05);
  }catch(err){}
}
function actualizarBtnSonido(){
  $('resp-sonido').textContent = sonidoOn ? '🔊 Sonido: activado' : '🔇 Sonido: desactivado';
}
$('resp-sonido').onclick = () => {
  sonidoOn = !sonidoOn;
  localStorage.setItem('sonidoResp', sonidoOn ? 'on' : 'off');
  actualizarBtnSonido();
};

function detenerRespiracion(){
  if (respTimer){ clearTimeout(respTimer); respTimer = null; }
}
function iniciarSesion(t){
  tecnicaActual = t;
  $('resp-elegir').style.display = 'none';
  $('resp-sesion').style.display = 'flex';
  $('resp-tecnica').textContent = t.nombre + ' · ' + t.patron;
  iniciarRespiracion(t);
}
function iniciarRespiracion(t){
  detenerRespiracion();
  const c = $('circulo'), tx = $('resp-texto'), k = $('resp-contador');
  let faseIdx = 0;
  function pinta(){
    const f = t.fases[faseIdx];
    c.style.transitionDuration = f.d + 's';
    c.classList.remove('f-inhala','f-sosten','f-exhala'); void c.offsetWidth;
    const tipo = f.n.startsWith('Inhala') ? 'f-inhala' : f.n.startsWith('Sost') ? 'f-sosten' : 'f-exhala';
    c.classList.add(tipo);
    tx.textContent = f.n;
    k.textContent = 'ciclo ' + (Math.floor(faseIdx/t.fases.length)+1) + ' de ' + t.ciclos;
    sonidoRespiracion(tipo, f.d);
    respTimer = setTimeout(() => {
      faseIdx++;
      if (faseIdx >= t.fases.length * t.ciclos){
        tx.textContent = '✦';
        k.textContent = 'Listo. Gracias por cuidarte 🌸';
        localStorage.setItem('breath_'+KEY_HOY, '1');
        setTimeout(() => $('overlay-resp').classList.remove('on'), 1800);
        return;
      }
      pinta();
    }, f.d * 1000);
  }
  pinta();
}

/* selector de técnicas */
RESPIRACIONES.forEach(t => {
  const b = document.createElement('button'); b.className = 'resp-card';
  b.innerHTML = '<b>' + t.nombre + '</b><span class="patron">' + t.patron +
    '</span><small>' + t.desc + '</small>';
  b.onclick = () => iniciarSesion(t);
  $('lista-resp').appendChild(b);
});
$('btn-respirar').onclick = () => {
  detenerRespiracion();
  $('overlay-resp').classList.add('on');
  $('resp-elegir').style.display = 'block';
  $('resp-sesion').style.display = 'none';
};
$('resp-cambiar').onclick = () => {
  detenerRespiracion();
  $('resp-sesion').style.display = 'none';
  $('resp-elegir').style.display = 'block';
};
function cerrarRespiracion(){
  detenerRespiracion();
  $('overlay-resp').classList.remove('on');
}
$('resp-cerrar').onclick = cerrarRespiracion;
$('resp-cerrar-sesion').onclick = cerrarRespiracion;

/* ---------- notificaciones 9:00 y 21:00 ---------- */
function mostrarNotif(titulo, cuerpo){
  const opts = { body: cuerpo, icon: 'icon-192.png', badge: 'icon-192.png' };
  if ('serviceWorker' in navigator && navigator.serviceWorker.ready){
    navigator.serviceWorker.ready.then(reg => reg.showNotification(titulo, opts)).catch(()=>{});
  } else if ('Notification' in window && Notification.permission === 'granted'){
    new Notification(titulo, opts);
  }
}
function revisarRecordatorios(){
  if (localStorage.getItem('notif') !== 'on') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const h = new Date().getHours();
  const slots = { am: 9, pm: 21 };
  for (const slot in slots){
    if (h >= slots[slot] && !localStorage.getItem('notif_'+KEY_HOY+'_'+slot)){
      const g = guardado(hoy.getMonth(), hoy.getDate());
      const leido = g && g.completo;
      const respiro = localStorage.getItem('breath_'+KEY_HOY);
      if (!leido || !respiro){
        const partes = [];
        if (!leido) partes.push('no has leído la frase del día');
        if (!respiro) partes.push('no has hecho tu respiración consciente');
        mostrarNotif('🌸 365 días para volver a mí',
          'Hoy ' + partes.join(' y ') + '. Tómate un momento para volver a ti.');
      }
      localStorage.setItem('notif_'+KEY_HOY+'_'+slot, '1');
    }
  }
}
function actualizarBtnNotif(){
  const activos = localStorage.getItem('notif') === 'on' &&
    Notification.permission === 'granted';
  $('btn-notif').textContent = activos ? '🔔 Recordatorios activados ✓' : '🔔 Activar recordatorios (9:00 y 21:00)';
  $('notif-estado').textContent = activos
    ? 'Te avisaremos si falta la frase del día o tu respiración 🌙'
    : '';
}
$('btn-notif').onclick = () => {
  if (!('Notification' in window)){
    $('notif-estado').textContent = 'Tu navegador no soporta notificaciones';
    return;
  }
  Notification.requestPermission().then(p => {
    if (p === 'granted'){
      localStorage.setItem('notif','on');
      revisarRecordatorios();
    }
    actualizarBtnNotif();
  });
};

/* ---------- navegación entre días ---------- */
function mover(dir){
  dd += dir;
  if (dd > DIAS_MES[mi]) { mi = (mi+1)%12; dd = 1; }
  if (dd < 1) { mi = (mi+11)%12; dd = DIAS_MES[mi]; }
  cargarDia(mi, dd, dir);
}
$('nav-ant').onclick = () => mover(-1);
$('nav-sig').onclick = () => mover(1);
$('nav-hoy').onclick = () => { mi = hoy.getMonth(); dd = hoy.getDate(); cargarDia(mi, dd); };

/* ---------- calendario ---------- */
MESES.forEach((n,m) => {
  const b = document.createElement('button'); b.className = 'mes-btn';
  b.innerHTML = '<div class="ic">🌸</div><div class="nm">' + n + '</div>';
  b.onclick = () => verDias(m);
  $('meses-grid').appendChild(b);
});
function verDias(m){
  $('meses-grid').style.display = 'none';
  $('dias-grid').style.display = 'grid';
  $('cal-atras').style.display = 'inline-block';
  $('cal-titulo').textContent = MESES[m];
  $('dias-grid').innerHTML = '';
  for (let d = 1; d <= DIAS_MES[m]; d++){
    const b = document.createElement('button'); b.className = 'dia-btn'; b.textContent = d;
    if (m === hoy.getMonth() && d === hoy.getDate()) b.classList.add('hoy');
    const gd = guardado(m,d);
    if (gd && gd.completo) b.classList.add('hecho');
    b.onclick = () => { mi = m; dd = d; cargarDia(mi, dd); mostrar('hoy'); };
    $('dias-grid').appendChild(b);
  }
}
$('cal-atras').onclick = () => {
  $('meses-grid').style.display = 'grid';
  $('dias-grid').style.display = 'none';
  $('cal-atras').style.display = 'none';
  $('cal-titulo').textContent = 'Elige un mes';
};

/* ---------- lenguaje simbólico ---------- */
Object.entries(BOOK.symbols).forEach(([em, s]) => {
  const div = document.createElement('div'); div.className = 'sim-item';
  div.innerHTML = '<h4><span class="em">' + em + '</span>' + s.name + '</h4><p>' + (s.desc || '') + '</p>';
  $('lista-simbolos').appendChild(div);
});

/* ---------- inicio ---------- */
function actualizarInicio(){
  const e = entrada(hoy.getMonth(), hoy.getDate());
  $('resumen-hoy').innerHTML = '<div class="em">' + e.emoji + '</div><h2>' +
    hoy.toLocaleDateString('es-ES',{day:'numeric',month:'long'}) + '</h2><p>' +
    e.text.split('\n')[0].slice(0,90) + '…</p>';
  const hechos = BOOK.days.filter(x => {
    const g = guardado(MESES.indexOf(x.month), x.day);
    return g && g.completo;
  }).length;
  $('st-hechos').textContent = hechos;
  $('st-falta').textContent = 365 - hechos;
  let racha = 0, f = new Date(hoy);
  while (true){
    const g = guardado(f.getMonth(), f.getDate());
    if (g && g.completo){ racha++; f.setDate(f.getDate()-1); } else break;
  }
  $('st-racha').textContent = racha;
  $('intro-texto').textContent = BOOK.intro;
  $('autora-texto').textContent = BOOK.autora;
}
function mostrar(v){
  document.querySelectorAll('.vista').forEach(x => x.classList.remove('activa'));
  $('vista-' + v).classList.add('activa');
  document.querySelectorAll('nav.barra button').forEach(b =>
    b.classList.toggle('activo', b.dataset.v === v));
  if (v === 'inicio'){ actualizarInicio(); actualizarBtnNotif(); }
}
document.querySelectorAll('nav.barra button').forEach(b => b.onclick = () => mostrar(b.dataset.v));

/* ---------- instalación ---------- */
let evtInstalar = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault();
  evtInstalar = e; $('btn-instalar').style.display = 'block'; });
$('btn-instalar').onclick = async () => { if (evtInstalar){ evtInstalar.prompt();
  evtInstalar = null; $('btn-instalar').style.display = 'none'; } };

/* ---------- arranque ---------- */
if ('serviceWorker' in navigator)
  navigator.serviceWorker.register('sw.js').catch(() => {});
cargarDia(mi, dd);
actualizarInicio();
actualizarBtnNotif();
revisarRecordatorios();
setInterval(revisarRecordatorios, 60000);
