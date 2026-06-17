const $ = id => document.getElementById(id);
const els = ['text','font','frame','palette','width','noise','ansi'].reduce((a,id)=>(a[id]=$(id),a),{});
const out = $('output');
const meta = $('meta');

const palettes = {
  bone:['#f4f0e8','#9b9489'], blood:['#ff365a','#7f1d2d'], acid:['#b7ff2a','#617f1d'],
  void:['#b7b7ff','#6868a8'], amber:['#ffbf4d','#8f5f21']
};

const glyphs = {
A:['  ___  ',' / _ \\ ','/ /_\\\\','|  _  |','| | | |'],B:['____  ','| __ ) ','|  _ \\ ','| |_) |','|____/ '],C:[' ____ ','/ ___|','| |   ','| |___','\\____|'],D:['____  ','|  _ \\ ','| | | |','| |_| |','|____/ '],E:[' _____','| ____|','|  _|  ','| |___ ','|_____|'],F:[' _____','|  ___|','| |_   ','|  _|  ','|_|    '],G:[' ____ ','/ ___|','| |  _','| |_| |','\\____|'],H:[' _   _ ','| | | |','| |_| |','|  _  |','|_| |_|'],I:[' ___ ','|_ _|',' | | ',' | | ','|___|'],J:['     _ ','    | |',' _  | |','| |_| |','\\___/ '],K:[' _  __','| |/ /','|   / ','| . \\ ','|_|\\_\\'],L:[' _     ','| |    ','| |    ','| |___ ','|_____|'],M:[' __  __ ','|  \\/  |','| |\\/| |','| |  | |','|_|  |_|'],N:[' _   _ ','| \\ | |','|  \\| |','| |\\  |','|_| \\_|'],O:[' ___ ','/ _ \\','| | | |','| |_| |','\\___/'],P:[' ____ ','|  _ \\','| |_) |','|  __/','|_|   '],Q:[' ___  ','/ _ \\ ','| | | |','| |_| |','\\__\\_\\'],R:[' ____ ','|  _ \\','| |_) |','|  _ <','|_| \\_\\'],S:[' ____ ','/ ___|','\\___ \\',' ___) |','|____/'],T:[' _____ ','|_   _|','  | |  ','  | |  ','  |_|  '],U:[' _   _ ','| | | |','| | | |','| |_| |','\\___/ '],V:['__     __','\\ \\   / /',' \\ \\ / / ','  \\ V /  ','   \\_/   '],W:['__        __','\\ \\      / /',' \\ \\ /\\ / / ','  \\ V  V /  ','   \\_/\\_/   '],X:['__  __','\\ \\/ /',' \\  / ',' /  \\ ','/_/\\_\\'],Y:['__   __','\\ \\ / /',' \\ V / ','  | |  ','  |_|  '],Z:[' _____','|__  /','  / / ',' / /_ ','/____|'],
'0':[' ___ ','/ _ \\','| | | |','| |_| |','\\___/'],'1':[' _ ','/ |','| |','| |','|_|'],'2':[' ___  ','|__ \\ ','  / / ',' / /_ ','|____|'],'3':[' _____','|___ /','  |_ \\',' ___) |','|____/'],'4':[' _  _   ','| || |  ','| || |_ ','|__   _|','   |_|  '],'5':[' ____ ','| ___|','|___ \\',' ___) |','|____/'],'6':['  __  ',' / /_ ','|  _ \\','| (_) |',' \\___/'],'7':[' _____','|___  |','   / / ','  / /  ',' /_/   '],'8':[' ___ ','( _ )','/ _ \\','| (_) |','\\___/'],'9':[' ___ ','/ _ \\','| (_) |',' \\__, |','   /_/'],' ':['   ','   ','   ','   ','   '],'-':['      ','      ',' ____ ','      ','      '],'.':['   ','   ','   ',' _ ','(_)']
};

function makeBanner(text,font){
  text = text.toUpperCase().replace(/[^A-Z0-9 .-]/g,'');
  let lines = ['', '', '', '', ''];
  for (const ch of text) {
    const g = glyphs[ch] || glyphs[' '];
    for (let i=0;i<5;i++) lines[i] += g[i] + '  ';
  }
  if(font==='shadow') lines = lines.map((l,i)=> i<4 ? l + '░'.repeat(Math.max(0,Math.floor(l.length/9))) : l);
  if(font==='goth') lines = lines.map(l => l.replaceAll('_','▄').replaceAll('|','▌').replaceAll('/','╱').replaceAll('\\','╲'));
  if(font==='runes') lines = lines.map(l => l.replace(/[A-Z]/g,c=>'ᚠᚢᚦᚨᚱᚲ'[c.charCodeAt(0)%6]).replaceAll('_','─').replaceAll('|','│'));
  if(font==='thin') lines = lines.map(l => l.replace(/[█▄▌]/g,'░').replace(/[|]/g,'│').replace(/_/g,'─'));
  return lines;
}

function center(line,w){ const pad=Math.max(0,w-line.length); return ' '.repeat(Math.floor(pad/2))+line+' '.repeat(Math.ceil(pad/2)); }
function wrapFrame(lines,type,w){
  const sigil = ['        /\\        ', '   .---/  \\---.   ', '  /   /____\\   \\  '];
  lines = lines.map(l=>center(l,w));
  if(type==='none') return lines;
  if(type==='box') return ['┌'+'─'.repeat(w)+'┐',...lines.map(l=>'│'+l+'│'),'└'+'─'.repeat(w)+'┘'];
  if(type==='double') return ['╔'+'═'.repeat(w)+'╗',...lines.map(l=>'║'+l+'║'),'╚'+'═'.repeat(w)+'╝'];
  if(type==='sigil') return [...sigil.map(l=>center(l,w)), '╭'+'─'.repeat(w)+'╮',...lines.map(l=>'│'+l+'│'),'╰'+'─'.repeat(w)+'╯'];
  return ['     /\\'.padEnd(w+2,' ')+'     ','    /  \\'.padEnd(w+2,' ')+'    ','╔'+'═'.repeat(w)+'╗',...lines.map(l=>'║'+l+'║'),'╚'+'═'.repeat(w)+'╝','  †  †  †'.padStart(Math.floor(w/2)+5,' ')];
}
function addNoise(lines,amount){
  const chars=['·','`','\'','.',':','*'];
  return lines.map(l=>l.split('').map(ch=> ch===' ' && Math.random()*100<amount ? chars[Math.floor(Math.random()*chars.length)] : ch).join(''));
}
function escape(s){return s.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));}
function render(){
  const [a,b]=palettes[els.palette.value]; document.documentElement.style.setProperty('--accent',a); document.documentElement.style.setProperty('--muted',b);
  const w=+els.width.value; let lines=makeBanner(els.text.value,els.font.value); lines=wrapFrame(lines,els.frame.value,w); lines=addNoise(lines,+els.noise.value);
  const plain=lines.join('\n'); out.dataset.plain=plain;
  if(els.ansi.checked){ document.body.classList.add('ansi'); out.innerHTML=escape(plain).split('\n').map((l,i)=>`<span class="${i%3===0?'c1':i%3===1?'c2':'dim'}">${l}</span>`).join('\n'); }
  else { document.body.classList.remove('ansi'); out.textContent=plain; }
  meta.textContent = `${plain.length} chars · ${lines.length} lines`;
}
['input','change'].forEach(ev=>document.addEventListener(ev,e=>{ if(e.target.closest('.controls')) render(); }));
$('copy').onclick=async()=>{await navigator.clipboard.writeText(out.dataset.plain); meta.textContent='copied to clipboard';};
$('download').onclick=()=>{const blob=new Blob([out.dataset.plain+'\n'],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ascii-banner.txt'; a.click(); URL.revokeObjectURL(a.href);};
$('randomize').onclick=()=>{ const words=['VOID LAMBDA','SEGFAULT','HEX MACHINE','BLOOD MODE','RITUAL CPU','NO GODS NO KERNELS','GARDEN SHED']; els.text.value=words[Math.floor(Math.random()*words.length)]; for (const id of ['font','frame','palette']) els[id].selectedIndex=Math.floor(Math.random()*els[id].options.length); els.noise.value=Math.floor(Math.random()*22); render(); };
render();
