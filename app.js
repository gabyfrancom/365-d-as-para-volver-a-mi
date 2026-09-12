const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_MES = [31,28,31,30,31,30,31,31,30,31,30,31];
const hoy = new Date();
let mi = hoy.getMonth(), dd = hoy.getDate();          // ← fecha del sistema del móvil
const clave = (m,d) => MESES[m]+'-'+d;
const entrada = (m,d) => BOOK.days.find(x => x.month === MESES[m] && x.day === d);
const $ = id => document.getElementById(id);
const guardado = (m,d) => JSON.parse(localStorage.getItem('entry_'+clave(m,d)) || 'null');

/* pétalos */
for (let i=0;i<10;i++){const p=document.createElement('div');p.className='petalio';
  p.textContent='🌸';p.style.left=(Math.random()*100)+'vw';
  p.style.animationDuration=(9+Math.random()*10)+'s';
  p.style.animationDelay=(Math.random()*10)+'s';p.style.fontSize=(12+Math.random()*14)+'px';
  $('petalos').appendChild(p);}

function ordinal(d){return d+(d===1?'º':d===2?'º':d===3?'er':'º')}
function cargarDia(m,d){
  const e = entrada(m,d), s = BOOK.symbols[e.emoji];
  const f = new Date(hoy.getFullYear(), m, d);
  $('fecha-larga').textContent = f.toLocaleDateString('es-ES',
    {weekday:'long', day:'numeric', month:'long'});
  $('emoji-dia').textContent = e.emoji;
  $('chip-simbolo').innerHTML = e.emoji+' '+(s?s.name:'');
  $('chip-simbolo').title = s ? s.desc : '';
  const lineas = e.text.split('\n');
  $('invitacion').textContent = lineas.length>1 ? lineas[lineas.length-1] : '';
  $('reflexion').textContent = lineas.slice(0,-1).join(' ') || e.text;
  // nota del mes: prólogo el día 1, epílogo el último día
  const nota = $('mes-nota'), ultimo = DIAS_MES[m];
  let pl = null;
  if (d===1) pl = BOOK.prologs.find(p=>p.month===MESES[m]&&p.type==='Prólogo');
  if (d===ultimo) pl = BOOK.prologs.find(p=>p.month===MESES[m]&&p.type==='Epílogo');
  if (pl){nota.style.display='block';
    nota.innerHTML='<h3>'+(d===1?'Prólogo':'Epílogo')+' · '+MESES[m]+'</h3><p>'+pl.text+'</p>';}
  else nota.style.display='none';
  // cargar registro guardado
  const g = guardado(m,d) || {};
  $('f-emocion').value = g.emocion||'';
  $('f-sensacion').value = g.sensacion||'';
  $('f-libre').value = g.libre||'';
  document.querySelectorAll('#f-energia button').forEach(b=>
    b.classList.toggle('sel', b.dataset.v === g.energia));
  const btn = $('btn-guardar');
  btn.textContent = g.completo ? 'Registro guardado ✓' : 'Guardar mi registro 🌸';
  btn.classList.toggle('guardado', !!g.completo);
  window.scrollTo({top:0, behavior:'smooth'});
}
$('btn-guardar').onclick = () => {
  const g = guardado(mi,dd) || {};
  const nuevo = {emocion:$('f-emocion').value, sensacion:$('f-sensacion').value,
    libre:$('f-libre').value, energia:g.energia, completo:true,
    fecha:new Date().toISOString().slice(0,10)};
  localStorage.setItem('entry_'+clave(mi,dd), JSON.stringify(nuevo));
  $('btn-guardar').textContent='Registro guardado ✓';
  $('btn-guardar').classList.add('guardado');
  actualizarInicio();
};
document.querySelectorAll('#f-energia button').forEach(b => b.onclick = () => {
  document.querySelectorAll('#f-energia button').forEach(x=>x.classList.remove('sel'));
  b.classList.add('sel');
  const g = guardado(mi,dd) || {}; g.energia = b.dataset.v;
  localStorage.setItem('entry_'+clave(mi,dd), JSON.stringify(g));
});
function mover(dir){
  dd += dir;
  if (dd > DIAS_MES[mi]) { mi=(mi+1)%12; dd=1; }
  if (dd < 1) { mi=(mi+11)%12; dd=DIAS_MES[mi]; }
  cargarDia(mi,dd);
}
$('nav-ant').onclick = () => mover(-1);
$('nav-sig').onclick = () => mover(1);
$('nav-hoy').onclick = () => { mi=hoy.getMonth(); dd=hoy.getDate(); cargarDia(mi,dd); };

/* calendario */
const mesEmoji = m => BOOK.prologs.find(p=>p.month===MESES[m]&&p.type==='Prólogo');
MESES.forEach((n,m)=>{
  const b=document.createElement('button'); b.className='mes-btn';
  b.innerHTML='<div class="ic">'+(mesEmoji(m)?'🌸':'🌸')+'</div><div class="nm">'+n+'</div>';
  b.onclick=()=>verDias(m); $('meses-grid').appendChild(b);
});
function verDias(m){
  $('meses-grid').style.display='none'; $('dias-grid').style.display='grid';
  $('cal-atras').style.display='inline-block';
  $('cal-titulo').textContent = MESES[m];
  $('dias-grid').innerHTML='';
  for (let d=1; d<=DIAS_MES[m]; d++){
    const b=document.createElement('button'); b.className='dia-btn'; b.textContent=d;
    if (m===hoy.getMonth() && d===hoy.getDate()) b.classList.add('hoy');
    if (guardado(m,d)?.completo) b.classList.add('hecho');
    b.onclick=()=>{ mi=m; dd=d; cargarDia(mi,dd); mostrar('hoy'); };
    $('dias-grid').appendChild(b);
  }
}
$('cal-atras').onclick=()=>{ $('meses-grid').style.display='grid';
  $('dias-grid').style.display='none'; $('cal-atras').style.display='none';
  $('cal-titulo').textContent='Elige un mes'; };

/* inicio */
function actualizarInicio(){
  const e = entrada(hoy.getMonth(), hoy.getDate());
  $('resumen-hoy').innerHTML='<div class="em">'+e.emoji+'</div><h2>'+
    hoy.toLocaleDateString('es-ES',{day:'numeric',month:'long'})+'</h2><p>'+
    e.text.split('\n')[0].slice(0,90)+'…</p>';
  const hechos = BOOK.days.filter(x=>guardado(MESES.indexOf(x.month),x.day)?.completo).length;
  $('st-hechos').textContent=hechos; $('st-falta').textContent=365-hechos;
  let racha=0, f=new Date(hoy);
  while (guardado(f.getMonth(), f.getDate())?.completo){ racha++; f.setDate(f.getDate()-1); }
  $('st-racha').textContent=racha;
  $('intro-texto').textContent=BOOK.intro;
  $('autora-texto').textContent=BOOK.autora;
}
function mostrar(v){
  document.querySelectorAll('.vista').forEach(x=>x.classList.remove('activa'));
  $('vista-'+v).classList.add('activa');
  document.querySelectorAll('nav.barra button').forEach(b=>
    b.classList.toggle('activo', b.dataset.v===v));
  if (v==='inicio') actualizarInicio();
}
document.querySelectorAll('nav.barra button').forEach(b=>b.onclick=()=>mostrar(b.dataset.v));

/* instalación */
let evtInstalar=null;
window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault();
  evtInstalar=e; $('btn-instalar').style.display='block'; });
$('btn-instalar').onclick=async()=>{ if(evtInstalar){evtInstalar.prompt(); evtInstalar=null;
  $('btn-instalar').style.display='none';} };

/* service worker + arranque */
if ('serviceWorker' in navigator)
  navigator.serviceWorker.register('sw.js').catch(()=>{});
cargarDia(mi,dd);   // ← abre SIEMPRE en el día presente del móvil
actualizarInicio();
