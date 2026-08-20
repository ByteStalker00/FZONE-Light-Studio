/* ---------- professional debugger: scrive errori/avvisi/eventi in log.txt ---------- */
  const LOG_QUEUE = [];
  let DEBUG_MODE = false;
  function logLine(level, msg){
    let line;
    try { line = '[' + new Date().toLocaleTimeString() + '] ' + level + ': ' + String(msg).slice(0,1500); } catch(e){ return; }
    try { LOG_QUEUE.push(line); } catch(e){}
    try { if (DEBUG_MODE) console.log(level, msg); } catch(e){}
    try { fetch('/log', { method:'POST', body: line, keepalive:true }).catch(function(){}); } catch(e){}
  }
  function flushLog(){
    let body;
    try { body = LOG_QUEUE.join('\n'); } catch(e){ return; }
    if (!body) return;
    LOG_QUEUE.length = 0;
    try {
      if (navigator.sendBeacon) navigator.sendBeacon('/log', new Blob([body], {type:'text/plain'}));
      else { const x = new XMLHttpRequest(); x.open('POST','/log',false); x.send(body); }
    } catch(e){}
  }
  window.addEventListener('error', function(ev){
    const ctx = ' @ ' + (ev.filename || '') + ':' + (ev.lineno || 0) + ':' + (ev.colno || 0);
    const stack = ev.error && ev.error.stack ? ' | ' + ev.error.stack : '';
    logLine('error', (ev.message || 'Errore') + ctx + stack);
  });
  window.addEventListener('unhandledrejection', function(ev){
    const r = ev.reason;
    const msg = r && (r.stack || r.message) ? (r.stack || r.message) : String(r);
    logLine('error', 'Promise rifiutata: ' + msg);
  });
  window.addEventListener('pagehide', flushLog);
  window.addEventListener('beforeunload', flushLog);

  const ROWS = document.getElementById('rows');
  const HEX = document.getElementById('hex');
  const QRBOX = document.getElementById('qrcode');
  const INFO = document.getElementById('info');
  const CRC = document.getElementById('crc');
  const STATUS = document.getElementById('status');
  const TIMELINE = document.getElementById('timeline');
  const FASCE = document.getElementById('fasce');
  let lastHex = '';

  const COL = { W:'#ffffff', R:'#e5534b', G:'#3fb950', B:'#58a6ff' };
  const KEYS = ['w','r','g','b'];

 /* ---------- tabelle ---------- */
  function addRow(entry){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="mini" style="color:#8b949e;">${ROWS.children.length + 1}</td>
      <td><input type="time" class="time" value="${entry.time}" step="60"></td>
      <td><input type="number" class="num" data-k="w" min="0" max="100" value="${entry.w}"></td>
      <td><input type="number" class="num" data-k="r" min="0" max="100" value="${entry.r}"></td>
      <td><input type="number" class="num" data-k="g" min="0" max="100" value="${entry.g}"></td>
      <td><input type="number" class="num" data-k="b" min="0" max="100" value="${entry.b}"></td>
      <td><span class="mix-cells">
        <span class="mcell" data-c="w" data-color="#f4f7fb" title="W: ${entry.w}%"></span>
        <span class="mcell" data-c="r" data-color="#e5534b" title="R: ${entry.r}%"></span>
        <span class="mcell" data-c="g" data-color="#3fb950" title="G: ${entry.g}%"></span>
        <span class="mcell" data-c="b" data-color="#58a6ff" title="B: ${entry.b}%"></span>
      </span></td>`;
    ROWS.appendChild(tr);
    refreshMix(tr);
    tr.querySelectorAll('input').forEach(i => i.addEventListener('input', () => {
      refreshMix(tr);
      clearPresetSelection();
      gen();
    }));
  }
  function readRows(){
    return [...ROWS.children].map(tr => {
      const [h, m] = (tr.querySelector('.time').value || '00:00').split(':').map(Number);
      const nums = {};
      tr.querySelectorAll('.num').forEach(n => nums[n.dataset.k] = parseInt(n.value, 10) || 0);
      return { h, m, w: nums.w, r: nums.r, g: nums.g, b: nums.b };
    });
  }
  function mixHex(h1, h2, f){
    const a = h1.match(/\w\w/g).map(x => parseInt(x, 16));
    const b = h2.match(/\w\w/g).map(x => parseInt(x, 16));
    const c = a.map((x, i) => Math.round(x + (b[i] - x) * f));
    return `rgb(${c.join(',')})`;
  }
  function refreshMix(tr){
    tr.querySelectorAll('.mcell').forEach(m => {
      const v = parseInt(tr.querySelector('.num[data-k="' + m.dataset.c + '"]').value, 10) || 0;
      // Colore esatto del canale (sempre visibile)
      m.style.background = m.dataset.color;
      // Livello di opacità in base alla percentuale (0% = 12% opaco, 100% = 100% opaco)
      m.style.opacity = 0.30 + 0.70 * (v / 100);
      m.title = m.dataset.c.toUpperCase() + ': ' + v + '%';
      m.innerHTML = '';
    });
  }

  /* ---------- encode / decode ---------- */
  function encodeConfig(slots){
    if (!slots.length) return '';
    const pad = Array(6 - Math.min(slots.length, 6)).fill({h:0,m:0,w:0,r:0,g:0,b:0});
    const full = slots.slice(0,6).concat(pad);
    const bytes = [0x55, 0xAA, 0x06, 0x00, 0x3E, 0x04, 0x01];
    for (let i = 0; i < 6; i++){
      const s = full[i];
      bytes.push(s.h&0xFF, s.m&0xFF, s.w&0xFF, s.g&0xFF, s.b&0xFF, s.r&0xFF, 0,0,0,0);
    }
    let crc = 0;
    for (const b of bytes) crc = (crc + b) & 0xFF;
    bytes.push(crc);
    return 'smartaqua_brite' + bytes.map(b => b.toString(16).padStart(2,'0')).join('');
  }
  function decodeConfig(hex){
    hex = hex.trim().replace(/^smartaqua_brite/i, '');
    if (!/^[0-9a-fA-F]+$/.test(hex)) throw new Error(t('invHex'));
    const bytes = hex.match(/.{2}/g).map(x => parseInt(x, 16));
    if (bytes.length !== 68) throw new Error(t('lenHex', {n:bytes.length}));
    const sum = bytes.slice(0, -1).reduce((a,x) => a+x, 0) & 0xFF;
    if (sum !== bytes[bytes.length-1]) throw new Error(t('crcErr', {exp:sum.toString(16), got:bytes[bytes.length-1].toString(16)}));
    if (bytes[0] !== 0x55 || bytes[1] !== 0xAA) throw new Error(t('hdrErr'));
    return { h:bytes[2], m:bytes[3], l:bytes[4], t:bytes[5], s:bytes[6],
      slots: [0,1,2,3,4,5].map(i => {
        const off = 7 + i*10;
        return { h:bytes[off], m:bytes[off+1], w:bytes[off+2], g:bytes[off+3], b:bytes[off+4], r:bytes[off+5] };
      }), crc: bytes[bytes.length-1] };
  }

  /* ---------- validazione ---------- */
  function validate(slots){
    const warnings = [];
    if (slots.length < 6) warnings.push(t('wEmpty', {n:6-slots.length}));
    const times = slots.map(s => s.h*60+s.m);
    for (let i = 1; i < times.length; i++)
      if (times[i] <= times[i-1]) warnings.push(t('wOrder', {n:i+1}));
    const used = new Set();
    for (const s of slots){
      const k = s.h+':'+s.m;
      if (used.has(k)) warnings.push(t('wDup', {t:k}));
      used.add(k);
    }
    for (const s of slots){
      for (const k of KEYS)
        if (s[k] < 0 || s[k] > 100) warnings.push(t('wRange', {t:s.h+':'+String(s.m).padStart(2,'0')}));
    }
    for (const s of slots){
      for (const k of KEYS)
        if (s[k] >= 1 && s[k] <= 3)
          warnings.push(t('wFlicker', {t:s.h+':'+String(s.m).padStart(2,'0'), c:k.toUpperCase()}));
    }
    return warnings;
  }

  /* ---------- main ---------- */
  function gen(){
    const slots = readRows();
    const hex = encodeConfig(slots);
    lastHex = hex;
    HEX.textContent = hex;
    const crcVal = hex.length ? hex.slice(-2).toUpperCase() : '—';
    CRC.textContent = 'CRC: 0x' + crcVal;
    const warnings = validate(slots);
    INFO.textContent = t('info', {n:slots.length, b:hex.length ? 68 : 0});
    STATUS.innerHTML = warnings.length
      ? `<span class="chip warn">${t('warn', {n:warnings.length})}</span>`
      : `<span class="chip ok">${t('ok')}</span>`;
    drawQR(hex);
    drawTimeline(slots);
    drawFasce(slots);
    if (lastSun) showSunInfo(lastSun);
  }

  function drawFasce(slots){
    if (!slots.length) { FASCE.textContent = ''; return; }
    const list = slots.map(s => ({ min: s.h*60+s.m, txt: `${String(s.h).padStart(2,'0')}:${String(s.m).padStart(2,'0')}`, w:s.w, r:s.r, g:s.g, b:s.b })).sort((a,b) => a.min - b.min);
    const parts = [];
    for (let i = 0; i < list.length; i++){
      const s = list[i];
      const next = list[(i + 1) % list.length];
      const wrap = i === list.length - 1;
      parts.push(
        `<div class="fline"><span class="frange"><b>${s.txt} – ${next.txt}</b>${wrap ? ` <span class="fnight">${t('nightSlot')}</span>` : ''}</span>` +
        `<span class="fch"><span class="fw">W${s.w}</span><span class="fr">R${s.r}</span><span class="fg">G${s.g}</span><span class="fb">B${s.b}</span></span></div>`
      );
    }
    FASCE.innerHTML = parts.join('');
  }

  function drawTimeline(slots){
    drawChart(slots, null);
    TIMELINE._slots = slots;
  }

  TIMELINE.addEventListener('mousemove', e => {
    const rect = TIMELINE.getBoundingClientRect();
    if (!rect.width) return;
    const min = Math.max(0, Math.min(1440, ((e.clientX - rect.left) / rect.width) * 1440));
    drawChart(TIMELINE._slots || [], min);
  });
  TIMELINE.addEventListener('mouseleave', () => drawChart(TIMELINE._slots || [], null));

  function drawChart(slots, hoverMin){
    if (!slots.length){ TIMELINE.getContext('2d').clearRect(0,0,TIMELINE.width,TIMELINE.height); return; }
    const dpr = window.devicePixelRatio || 1;
    const W = TIMELINE.clientWidth || 600, H = 150;
    TIMELINE.width = W*dpr; TIMELINE.height = H*dpr;
    TIMELINE.style.height = H+'px';
    const ctx = TIMELINE.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);

    const padL = 32, padR = 10, padT = 10, padB = 24;
    const cw = W - padL - padR, ch = H - padT - padB;

    const sort = slots.slice().sort((a,b) => a.h*60+a.m - b.h*60+b.m);
    const times = sort.map(s => s.h*60+s.m);
    const n = sort.length;

    const X = min => padL + (min/1440)*cw;
    const Y = v => padT + ch - (v/100)*ch;

    function valAt(min, key){
      if (!n) return 0;
      let i = 0;
      while (i < n && min > times[i]) i++;
      const prev = (i - 1 + n) % n;
      const next = i % n;
      let t0 = times[prev], t1 = times[next];
      if (t1 <= t0) t1 += 1440;
      let x = min;
      if (x < t0) x += 1440;
      if (t1 === t0) return sort[prev][key];
      const f = (x - t0) / (t1 - t0);
      return sort[prev][key] + (sort[next][key] - sort[prev][key]) * f;
    }

    // banda del fotoperiodo: dal primo all'ultimo slot attivo
    const act = sort.filter(s => s.w || s.r || s.g || s.b);
    if (act.length){
      const rise = act[0].h*60 + act[0].m;
      const set  = act[act.length-1].h*60 + act[act.length-1].m;
      ctx.fillStyle = 'rgba(255,190,110,0.05)';
      ctx.fillRect(X(rise), padT, Math.max(X(set)-X(rise), 1), ch);
    }

    // griglia orizzontale 0..100%
    ctx.font = '9px Consolas';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let v = 0; v <= 100; v += 25){
      const y = Y(v);
      ctx.strokeStyle = 'rgba(72,79,88,0.28)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W-padR, y); ctx.stroke();
      ctx.fillStyle = '#6e7681';
      ctx.fillText(v + '%', padL - 4, y);
    }

    // griglia verticale ogni ora (etichetta ogni 3h)
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let h = 0; h <= 24; h++){
      const x = X(h*60);
      ctx.strokeStyle = (h % 3 === 0) ? 'rgba(72,79,88,0.32)' : 'rgba(72,79,88,0.10)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ch); ctx.stroke();
      if (h % 3 === 0){
        ctx.fillStyle = '#6e7681';
        ctx.fillText(String(h).padStart(2,'0'), x, padT + ch + 3);
      }
    }

    // linee canali, campionate ogni minuto (precisione massima)
    KEYS.forEach(key => {
      const color = COL[key.toUpperCase()];
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let m = 0; m <= 1440; m++){
        const x = X(m), y = Y(valAt(m, key));
        m === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.stroke();
    });

    // pallini sulle fasce
    for (const s of sort){
      const x = X(s.h*60 + s.m);
      KEYS.forEach(key => {
        ctx.beginPath();
        ctx.arc(x, Y(s[key]), 3.2, 0, Math.PI*2);
        ctx.fillStyle = COL[key.toUpperCase()]; ctx.fill();
        ctx.strokeStyle = '#0b1119'; ctx.lineWidth = 1.5; ctx.stroke();
      });
    }

    // etichette HH:MM delle fasce
    ctx.font = '9px Consolas'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#8b949e';
    for (const s of sort){
      ctx.fillText(String(s.h).padStart(2,'0') + ':' + String(s.m).padStart(2,'0'), X(s.h*60 + s.m), padT + ch + 14);
    }

    // hover: righello verticale + tooltip con valori esatti
    if (hoverMin != null){
      const x = X(hoverMin);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ch); ctx.stroke();
      ctx.setLineDash([]);

      const hh = Math.floor(hoverMin/60), mm = Math.floor(hoverMin % 60);
      const lines = [
        String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0'),
        ...KEYS.map(k => k.toUpperCase() + ': ' + Math.round(valAt(hoverMin, k)) + '%')
      ];
      ctx.font = '10px Consolas';
      const tw = Math.max(...lines.map(l => ctx.measureText(l).width));
      const bw = tw + 16, bh = lines.length * 15 + 10;
      let bx = x + 10, by = padT;
      if (bx + bw > W - padR) bx = x - 10 - bw;
      if (by + bh > H - padB) by = H - padB - bh;
      ctx.fillStyle = 'rgba(11,17,25,0.92)';
      ctx.strokeStyle = 'rgba(139,148,158,0.6)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 6); else ctx.rect(bx, by, bw, bh);
      ctx.fill(); ctx.stroke();
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      let ty = by + 10;
      for (let i = 0; i < lines.length; i++){
        ctx.fillStyle = i === 0 ? '#e6edf3' : COL[KEYS[i-1].toUpperCase()];
        ctx.fillText(lines[i], bx + 8, ty);
        ty += 15;
      }
    }
  }

  function drawQR(text){
    QRBOX.innerHTML = '';
    if (!text) return;
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const svg = qr.createSvgTag({ scalable: true, cellSize: 2, margin: 1 });
    const tmp = document.createElement('div');
    tmp.innerHTML = svg;
    QRBOX.appendChild(tmp.firstChild);
    const svgElem = QRBOX.querySelector('svg');
    if (svgElem) {
      svgElem.style.maxWidth = '300px';
      svgElem.style.maxHeight = '300px';
    }
  }

  function toPng(){
    if (!lastHex) return alert(t('genFirst'));
    const canvas = document.createElement('canvas');
    const qr = qrcode(0, 'M');
    qr.addData(lastHex); qr.make();
    const sz = qr.getModuleCount(), scale = 8, pad = 8;
    canvas.width = (sz+pad*2)*scale; canvas.height = (sz+pad*2)*scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#000';
    for (let r=0;r<sz;r++) for (let c=0;c<sz;c++)
      if (qr.isDark(r,c)) ctx.fillRect((c+pad)*scale,(r+pad)*scale,scale,scale);
    const a = document.createElement('a');
    a.download = 'fzone_qr.png'; a.href = canvas.toDataURL('image/png'); a.click();
    logLine('info', 'QR PNG scaricato');
  }

  function copyHex(){
    if (!lastHex) return alert(t('genFirst'));
    navigator.clipboard.writeText(lastHex).then(() => {
      logLine('info', 'Hex copiato negli appunti');
      const b = document.getElementById('copy');
      b.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg> <span>${t('copied')}</span>`;
      setTimeout(() => {
        b.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/></svg> <span>${t('copyHex')}</span>`;
      }, 1400);
    });
  }

  function fillSlots(slots){
    ROWS.innerHTML = '';
    slots.forEach(s => addRow({
      time: `${String(s.h).padStart(2,'0')}:${String(s.m).padStart(2,'0')}`,
      w:s.w, r:s.r, g:s.g, b:s.b
    }));
    // sincronizza lo slider con il blu delle fasce notturne (W=R=G=0)
    const night = slots.filter(s => s.w === 0 && s.r === 0 && s.g === 0);
    if (night.length){
      const v = Math.max(...night.map(s => s.b));
      MOON.value = v;
      MOONVAL.textContent = v;
      syncMoonTrack();
    }
    gen();
  }
const MOON = document.getElementById('moon');
  const MOONVAL = document.getElementById('moonVal');
  let currentPreset = 'sunMoon';

  function clearPresetSelection(){
    currentPreset = null;
    document.querySelectorAll('.preset').forEach(x => x.classList.remove('active'));
  }

  function buildPresetButtons(){
    const box = document.getElementById('presets');
    box.innerHTML = '';
    PRESET_ORDER.forEach(id => {
      const b = document.createElement('span');
      b.className = 'preset';
      b.dataset.name = id;
      b.innerHTML = (ICONS[id] || '') + tps(id);
      b.addEventListener('click', () => {
        document.querySelectorAll('.preset').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        currentPreset = id;
        logLine('info', 'Profilo selezionato: ' + id);
        fillSlots(PRESETS[id]);
      });
      box.appendChild(b);
    });
    const active = box.querySelector('[data-name="' + currentPreset + '"]');
    if (active) active.classList.add('active');
  }

  function applyMoon(v){
    const rows = [...ROWS.children];
    if (!rows.length) return;
    // le fasce "notturne" sono quelle con W=R=G=0 → solo blu luna
    rows.forEach(tr => {
      const n = {};
      tr.querySelectorAll('.num').forEach(x => n[x.dataset.k] = parseInt(x.value,10)||0);
      if (n.w === 0 && n.r === 0 && n.g === 0){
        const b = tr.querySelector('.num[data-k="b"]');
        b.value = v;
      }
    });
    gen();
  }

  function syncMoonTrack(){
    const v = parseInt(MOON.value,10)||0, min = parseInt(MOON.min,10)||0, max = parseInt(MOON.max,10)||30;
    const pct = Math.round((v - min) / (max - min) * 100);
    MOON.style.background = `linear-gradient(90deg,#1d4ed8 ${pct}%,#2a3b52 ${pct}%)`;
  }

  MOON.addEventListener('input', () => {
    MOONVAL.textContent = MOON.value;
    syncMoonTrack();
    clearPresetSelection();
    applyMoon(parseInt(MOON.value,10));
  });

  /* ---------- events ---------- */
  document.getElementById('gen').addEventListener('click', gen);
  document.getElementById('gen').addEventListener('click', () => {
    const warnings = validate(readRows());
    if (warnings.length) warnings.forEach(w => logLine('warn', 'Validazione: ' + w));
    else logLine('info', 'Update QR: profilo valido');
  });
  document.getElementById('dl').addEventListener('click', toPng);
  document.getElementById('copy').addEventListener('click', copyHex);
  document.getElementById('addRow').addEventListener('click', () => {
    if (ROWS.children.length >= 6) return alert(t('maxSlots'));
    clearPresetSelection();
    addRow({ time:'12:00', w:0, r:0, g:0, b:0 }); gen();
  });
  document.getElementById('delRow').addEventListener('click', () => {
    if (ROWS.children.length > 1){ clearPresetSelection(); ROWS.lastElementChild.remove(); gen(); }
  });
  document.getElementById('sortBtn').addEventListener('click', () => {
    const slots = readRows().sort((a,b) => a.h*60+a.m - b.h*60+b.m);
    clearPresetSelection();
    fillSlots(slots);
  });
  document.getElementById('impBtn').addEventListener('click', () => {
    try {
      const d = decodeConfig(document.getElementById('inHex').value);
      clearPresetSelection();
      logLine('info', 'Import hex: ' + d.slots.length + ' slot decodificati');
      fillSlots(d.slots);
      document.getElementById('inHex').value = '';
    } catch (e) {
      logLine('warn', 'Import hex fallito: ' + e.message);
      alert(t('decodeErr') + e.message);
    }
  });
  document.getElementById('inHex').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('impBtn').click();
  });

  window.addEventListener('resize', () => drawTimeline(readRows()));

  /* ---------- sole: alba/tramonto dalla posizione ---------- */
  const SUN_LAT = document.getElementById('sunLat');
  const SUN_LON = document.getElementById('sunLon');
  const SUN_DATE = document.getElementById('sunDate');
  const SUN_INFO = document.getElementById('sunInfo');
  let lastSun = null;
  SUN_DATE.valueAsDate = new Date();

  function calcSunHours(date, lat, lng){
    const rad = Math.PI/180;
    const d = date.getDate(), m = date.getMonth()+1, y = date.getFullYear();
    const N1 = Math.floor(275*m/9), N2 = Math.floor((m+9)/12), N3 = (1+Math.floor((y-4*Math.floor(y/4)+2)/3));
    const N = N1 - N2*N3 + d - 30;
    const lngHour = lng/15;
    const tRise = N + ((6 - lngHour)/24);
    const tSet  = N + ((18 - lngHour)/24);
    const zenith = 90.833;
    const tz = new Date().getTimezoneOffset()/-60;

    function hourOf(t, rising){
      const M = 0.9856*t - 3.289;
      let L = M + 1.916*Math.sin(rad*M) + 0.020*Math.sin(rad*2*M) + 282.634;
      L = ((L%360)+360)%360;
      let RA = Math.atan(0.91764*Math.tan(rad*L))/rad;
      RA = ((RA%360)+360)%360;
      RA += (Math.floor(L/90)*90 - Math.floor(RA/90)*90);
      RA /= 15;
      const sinDec = 0.39782*Math.sin(rad*L);
      const cosDec = Math.cos(Math.asin(sinDec));
      const cosH = (Math.cos(rad*zenith) - sinDec*Math.sin(rad*lat)) / (cosDec*Math.cos(rad*lat));
      if (cosH > 1 || cosH < -1) return null;
      const H = (rising ? 360 - Math.acos(cosH)/rad : Math.acos(cosH)/rad)/15;
      const T = H + RA - 0.06571*t - 6.622;
      const UT = ((T - lngHour)%24 + 24)%24;
      return ((UT + tz)%24 + 24)%24;
    }
    return { sunrise: hourOf(tRise, true), sunset: hourOf(tSet, false) };
  }

  function sunToSlots(sun){
    const moon = Math.max(0, parseInt(MOON.value,10) || 0);
    const sr = sun.sunrise*60, ss = sun.sunset*60;
    const dayLen = ss - sr;
    let s1min = sr - 60, s6min = ss + 60;
    if (s1min < 0) s1min = 0;
    if (s6min > 1439) s6min = 1439;
    const mk = (min, w,r,g,b) => ({ h:Math.floor(min/60), m:Math.round(min%60), w,r,g,b });
    return [
      mk(s1min, 0,0,0,moon),
      mk(sr, 22,18,12,8),
      mk(sr + dayLen/3, 80,42,18,48),
      mk(sr + dayLen/2, 92,48,20,62),
      mk(ss, 55,36,16,6),
      mk(s6min, 0,0,0,moon)
    ];
  }

  function showSunInfo(sun){
    const f = h => { h = ((h%24)+24)%24; const hh=Math.floor(h), mm=Math.round((h-hh)*60); return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0'); };
    SUN_INFO.textContent = t('sunInfo', {rise:f(sun.sunrise), set:f(sun.sunset)});
  }

  document.getElementById('sunGo').addEventListener('click', () => {
    const lat = parseFloat(SUN_LAT.value), lng = parseFloat(SUN_LON.value);
    if (isNaN(lat) || isNaN(lng)){ SUN_INFO.textContent = t('sunNoPos'); return; }
    const date = SUN_DATE.valueAsDate
      ? new Date(SUN_DATE.valueAsDate.getFullYear(), SUN_DATE.valueAsDate.getMonth(), SUN_DATE.valueAsDate.getDate())
      : new Date();
    const sun = calcSunHours(date, lat, lng);
    if (sun.sunrise == null || sun.sunset == null){ SUN_INFO.textContent = t('sunPolar'); return; }
    lastSun = sun;
    clearPresetSelection();
    logLine('info', 'Sincronizzazione sole: lat=' + lat + ' lng=' + lng + ' (alba ' + sun.sunrise.toFixed(2) + 'h, tramonto ' + sun.sunset.toFixed(2) + 'h)');
    fillSlots(sunToSlots(sun));
    showSunInfo(sun);
  });

  document.getElementById('locBtn').addEventListener('click', () => {
    if (!navigator.geolocation){ SUN_INFO.textContent = t('sunGeoErr'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      SUN_LAT.value = pos.coords.latitude.toFixed(4);
      SUN_LON.value = pos.coords.longitude.toFixed(4);
      document.getElementById('sunGo').click();
    }, () => { SUN_INFO.textContent = t('sunGeoErr'); }, { timeout: 10000 });
  });

  buildPresetButtons();
  applyLang();
  fillSlots(PRESETS[currentPreset]);
logLine('info', 'FZONE Light Studio caricato correttamente');