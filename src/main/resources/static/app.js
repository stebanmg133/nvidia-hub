const tickers = ['NVIDIA · COMPUTACIÓN ACELERADA','AI FACTORIES · BLACKWELL','CUDA · 20+ AÑOS DE INNOVACIÓN','OMNIVERSE · GEMELOS DIGITALES','NVIDIA NIM · IA EN PRODUCCIÓN','JETSON · ROBÓTICA EN EL EDGE'];
const tickerMarkup = tickers.map((item) => `<span class="flex items-center gap-3"><i class="w-1 h-1 rounded-full bg-acid"></i>${item}</span>`).join('');
document.querySelector('.ticker').innerHTML = tickerMarkup + tickerMarkup;

const menuBtn = document.getElementById('menuBtn');
menuBtn.addEventListener('click', () => {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
  menuBtn.setAttribute('aria-expanded', String(!menu.classList.contains('hidden')));
});
document.querySelectorAll('#mobileMenu a').forEach((link) => link.addEventListener('click', () => document.getElementById('mobileMenu').classList.add('hidden')));

const dialog = document.getElementById('videoDialog');
document.querySelectorAll('.media-open').forEach((card) => card.addEventListener('click', () => {
  document.getElementById('videoTitle').textContent = card.dataset.title;
  document.getElementById('videoLink').href = card.dataset.video;
  dialog.showModal();
}));
document.getElementById('closeVideo').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
document.querySelectorAll('.filter-btn').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.filter-btn').forEach((item) => { item.classList.remove('bg-acid', 'text-black', 'font-semibold'); item.classList.add('glass'); });
  button.classList.add('bg-acid', 'text-black', 'font-semibold'); button.classList.remove('glass');
  const filter = button.dataset.filter;
  document.querySelectorAll('.media-card').forEach((card, index) => {
    const kind = card.dataset.kind || (index === 1 ? 'world' : 'ai');
    card.hidden = filter !== 'all' && filter !== kind;
  });
}));

const parts = [
  { id:'gpu', name:'Tarjeta gráfica', icon:'◉', options:[['GeForce RTX 5060 Ti',429,7,650],['GeForce RTX 5070',599,8,750],['GeForce RTX 5070 Ti',799,9,800],['GeForce RTX 5080',999,10,850],['GeForce RTX 5090',1999,10,1000]] },
  { id:'cpu', name:'Procesador', icon:'⌘', options:[['AMD Ryzen 5 9600X',279,7,0],['AMD Ryzen 7 9800X3D',479,9,0],['AMD Ryzen 9 9950X',599,10,0],['Intel Core Ultra 7 265K',379,8,0],['Intel Core Ultra 9 285K',589,10,0]] },
  { id:'board', name:'Placa base', icon:'▦', options:[['B850 WiFi (AM5)',229,8,0],['X870E WiFi (AM5)',349,10,0],['Z890 WiFi (LGA1851)',299,9,0]] },
  { id:'ram', name:'Memoria', icon:'▤', options:[['32 GB DDR5',109,7,0],['64 GB DDR5',199,9,0],['128 GB DDR5',389,10,0]] },
  { id:'storage', name:'Almacenamiento', icon:'▱', options:[['SSD NVMe 1 TB Gen4',89,7,0],['SSD NVMe 2 TB Gen4',149,9,0],['SSD NVMe 4 TB Gen5',349,10,0]] },
  { id:'psu', name:'Fuente de poder', icon:'ϟ', options:[['750 W 80+ Gold',119,7,750],['850 W 80+ Gold',149,9,850],['1000 W 80+ Platinum',229,10,1000],['1200 W 80+ Platinum',329,10,1200]] },
  { id:'case', name:'Gabinete', icon:'▣', options:[['Mid tower airflow',109,8,0],['Full tower panorámico',189,9,0]] },
];
const initialBuild = {gpu:1,cpu:1,board:0,ram:1,storage:1,psu:1,case:0};
let build = {...initialBuild};
const componentList = document.getElementById('componentList');
componentList.innerHTML = parts.map((part) => `<div class="py-4 grid sm:grid-cols-[1fr_1.2fr_auto] gap-3 items-center"><div class="flex items-center gap-3"><span class="w-9 h-9 rounded-xl bg-white/[.06] grid place-items-center text-acid">${part.icon}</span><span class="text-xs font-medium">${part.name}</span></div><select data-part="${part.id}" class="part-select min-w-0 rounded-xl border border-white/10 bg-[#111512] px-3 py-3 text-xs text-white focus:border-acid/60 outline-none">${part.options.map((option,index)=>`<option value="${index}">${option[0]}</option>`).join('')}</select><span data-price="${part.id}" class="text-xs text-white/50 sm:text-right"></span></div>`).join('');
function renderBuild(){
  let total=0,score=0; const selected={};
  for(const part of parts){const choice=part.options[build[part.id]];selected[part.id]=choice;total+=choice[1];score+=choice[2];componentList.querySelector(`[data-part="${part.id}"]`).value=build[part.id];componentList.querySelector(`[data-price="${part.id}"]`).textContent=`$${choice[1].toLocaleString('en-US')}`;}
  document.getElementById('buildTotal').textContent=`$${total.toLocaleString('en-US')}`;
  const rating=Math.round(score/parts.length*10);document.getElementById('buildScore').textContent=`${rating}/100`;
  document.getElementById('buildMeter').style.width=`${rating}%`;
  const platformMatch=(selected.cpu[0].includes('Ryzen'))===selected.board[0].includes('AM5');
  const gpuPower=selected.gpu[3],psuPower=selected.psu[3];
  const checks=[{ok:platformMatch,text:platformMatch?'CPU y placa: plataforma compatible':'CPU y placa: revisa el socket (AM5 / LGA1851)'},{ok:psuPower>=gpuPower,text:psuPower>=gpuPower?'Fuente: potencia recomendada para la GPU':`Fuente: se recomiendan ${gpuPower} W o más para esta GPU`}];
  document.getElementById('compatibility').innerHTML=checks.map(c=>`<div class="flex gap-2 items-start text-[10px] ${c.ok?'text-acid':'text-amber-300'}"><span>${c.ok?'✓':'!'}</span><span>${c.text}</span></div>`).join('');
}
componentList.addEventListener('change',(event)=>{const id=event.target.dataset.part;if(id){build[id]=Number(event.target.value);renderBuild();}});
document.querySelectorAll('.preset-btn').forEach((button)=>button.addEventListener('click',()=>{
  document.querySelectorAll('.preset-btn').forEach(b=>{b.classList.remove('bg-acid','text-black','font-semibold');b.classList.add('glass');});button.classList.add('bg-acid','text-black','font-semibold');button.classList.remove('glass');
  const preset=button.dataset.preset;
  build=preset==='gaming'?{gpu:1,cpu:1,board:0,ram:0,storage:0,psu:0,case:0}:preset==='creator'?{gpu:3,cpu:2,board:1,ram:1,storage:1,psu:1,case:1}:{gpu:4,cpu:2,board:1,ram:2,storage:2,psu:3,case:1};renderBuild();
}));
document.getElementById('resetBuild').addEventListener('click',()=>{build={...initialBuild};renderBuild();});
document.getElementById('copyBuild').addEventListener('click',async()=>{const summary=parts.map(p=>`${p.name}: ${p.options[build[p.id]][0]}`).join('\n')+`\nTotal estimado: ${document.getElementById('buildTotal').textContent}`;try{await navigator.clipboard.writeText(summary);document.getElementById('copyNotice').textContent='Configuración copiada al portapapeles';}catch{document.getElementById('copyNotice').textContent='No se pudo acceder al portapapeles';}setTimeout(()=>document.getElementById('copyNotice').textContent='',2400);});
renderBuild();

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: 0.12 });
document.querySelectorAll('main > section:not(:first-child)').forEach((section) => { section.classList.add('reveal'); revealObserver.observe(section); });

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
async function loadQuote() {
  try {
    const response = await fetch('/api/quote');
    const data = await response.json();
    if (!response.ok || !data.price) throw new Error('quote unavailable');
    document.getElementById('stockPrice').textContent = money.format(data.price);
    const positive = data.change >= 0;
    const change = document.getElementById('stockChange');
    change.textContent = `${positive ? '+' : ''}${money.format(data.change)} (${positive ? '+' : ''}${Number(data.changePercent).toFixed(2)}%) hoy`;
    change.className = positive ? 'text-acid' : 'text-rose-400';
    document.getElementById('marketStatus').textContent = data.marketState.replaceAll('_', ' ');
    document.getElementById('quoteSource').textContent = `Fuente: ${data.source}`;
  } catch {
    document.getElementById('stockPrice').textContent = 'NVDA';
    document.getElementById('stockChange').textContent = 'Cotización no disponible ahora';
    document.getElementById('stockChange').className = 'text-white/45';
    document.getElementById('marketStatus').textContent = 'DATA OFFLINE';
  }
}

function safeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Actualidad' : new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
async function loadNews() {
  const grid = document.getElementById('newsGrid');
  try {
    const response = await fetch('/api/news');
    const data = await response.json();
    if (!response.ok || !data.items?.length) throw new Error('news unavailable');
    grid.innerHTML = data.items.slice(0, 6).map((item, index) => `
      <a class="news-card glass rounded-2xl p-5 min-h-[205px] flex flex-col justify-between hover:border-acid/35 transition rise" style="animation-delay:${index * 60}ms" href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer">
        <div class="flex justify-between gap-4"><span class="mono text-[9px] text-acid tracking-wider">${escapeHtml(item.source)}</span><span class="mono text-[9px] text-white/30">${escapeHtml(safeDate(item.date))}</span></div>
        <div class="mt-8 text-[15px] leading-6 font-medium">${escapeHtml(item.title)}<span class="arrow inline-block ml-2 text-acid">↗</span></div>
        <div class="mt-5 text-[10px] text-white/30">Leer en fuente oficial</div>
      </a>`).join('');
    document.getElementById('newsSource').textContent = `Fuentes: ${data.source} · actualizado ${safeDate(data.updatedAt)}`;
  } catch {
    grid.innerHTML = `<a class="glass rounded-2xl p-6 md:col-span-3 text-sm text-white/50" href="https://nvidianews.nvidia.com/" target="_blank" rel="noopener">Las noticias no están disponibles en este momento. Visita NVIDIA Newsroom <span class="text-acid">↗</span></a>`;
  }
}
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function escapeAttr(value = '') { return escapeHtml(value); }

loadQuote();
loadNews();
setInterval(loadQuote, 60_000);
