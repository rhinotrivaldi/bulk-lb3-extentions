(() => {
  const BASE = '/siraja-2024/lb3/dihasilkan';

  const kodeOptions = [...document.querySelectorAll('select[name="form[id_daftar_limbah]"] option')]
    .filter(o => o.value)
    .map(o => ({ value: o.value, text: o.textContent.trim().replace(/\s+/g, ' ') }));

  const maxDate = new Date().toLocaleDateString('en-CA');
  let minDate = '';
  for (const s of document.querySelectorAll('script:not([src])')) {
    const m = s.textContent.match(/dateMin\s*=\s*'(\d{4}-\d{2}-\d{2})'/);
    if (m) { minDate = m[1]; break; }
  }

  const kemasanCache = {};
  async function fetchKemasan(id) {
    if (kemasanCache[id]) return kemasanCache[id];
    const res = await fetch(BASE + '/package/' + id, { credentials: 'same-origin' });
    if (res.url.includes('/login')) return null;
    let html = await res.text();
    try { html = JSON.parse(html); } catch (e) {}
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const list = [...doc.querySelectorAll('option')]
      .filter(o => o.value)
      .map(o => ({ value: o.value, text: o.textContent.trim().replace(/\s+/g, ' ') }));
    kemasanCache[id] = list;
    return list;
  }

const style = document.createElement('style');
  style.textContent = `
    :root {
      --sbe-blue: #1a73e8;
      --sbe-blue-hover: #174ea6;
      --sbe-border: #dadce0;
      --sbe-text: #202124;
      --sbe-text-muted: #5f6368;
      --sbe-bg: #ffffff;
      --sbe-bg-hover: #f1f3f4;
      --sbe-danger: #ea4335;
    }
    
    #sbe-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      background: var(--sbe-bg);
      border: 1px solid var(--sbe-border);
      border-radius: 8px;
      width: 720px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: var(--sbe-text);
      display: flex;
      flex-direction: column;
    }
    
    #sbe-panel * {
      box-sizing: border-box;
    }

    #sbe-panel .sbe-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid var(--sbe-border);
      border-radius: 8px 8px 0 0;
      font-weight: 600;
      font-size: 14px;
    }

    #sbe-panel .sbe-x {
      border: none;
      background: none;
      cursor: pointer;
      color: var(--sbe-text-muted);
      font-size: 14px;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    #sbe-panel .sbe-x:hover {
      background: var(--sbe-bg-hover);
      color: var(--sbe-text);
    }

    #sbe-body {
      padding: 16px;
    }

    #sbe-rows {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 16px;
      padding-right: 4px;
    }

    #sbe-panel .sbe-row {
      display: grid;
      grid-template-columns: 1fr 1fr 130px 80px 120px 32px;
      gap: 8px;
      margin-bottom: 8px;
      align-items: center;
    }

    #sbe-panel select, #sbe-panel input {
      width: 100%;
      height: 32px;
      padding: 4px 8px;
      border: 1px solid var(--sbe-border);
      border-radius: 4px;
      font-size: 13px;
      color: var(--sbe-text);
      background: var(--sbe-bg);
      transition: border-color 0.2s;
    }

    #sbe-panel select:focus, #sbe-panel input:focus {
      outline: none;
      border-color: var(--sbe-blue);
      box-shadow: 0 0 0 1px var(--sbe-blue);
    }

    #sbe-panel select:disabled {
      background: #f1f3f4;
      color: var(--sbe-text-muted);
      cursor: not-allowed;
    }

    #sbe-panel .sbe-del {
      height: 32px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--sbe-text-muted);
      font-size: 18px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    #sbe-panel .sbe-del:hover {
      background: #fce8e6;
      color: var(--sbe-danger);
    }

    #sbe-panel .sbe-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }

    #sbe-panel .sbe-btn {
      height: 32px;
      padding: 0 16px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid var(--sbe-border);
      background: var(--sbe-bg);
      color: var(--sbe-blue);
      transition: background 0.2s;
    }

    #sbe-panel .sbe-btn:hover {
      background: #f4f8fe;
    }

    #sbe-panel .sbe-btn-primary {
      background: var(--sbe-blue);
      color: white;
      border: none;
    }

    #sbe-panel .sbe-btn-primary:hover {
      background: var(--sbe-blue-hover);
    }
    
    #sbe-panel .sbe-btn:disabled {
      background: var(--sbe-border);
      color: var(--sbe-text-muted);
      cursor: not-allowed;
      border: none;
    }

    #sbe-log {
      max-height: 120px;
      overflow-y: auto;
      background: #202124;
      color: #8ab4f8;
      padding: 12px;
      margin-top: 16px;
      border-radius: 4px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 12px;
      white-space: pre-wrap;
      line-height: 1.5;
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.id = 'sbe-panel';
  panel.innerHTML = `
    <div class="sbe-head">
      <span>Bulk Entry LB3</span>
      <button id="sbe-toggle" class="sbe-x" title="Minimize/Maximize">&#9660;</button>
    </div>
    <div id="sbe-body">
      <div id="sbe-rows"></div>
      <div class="sbe-footer">
        <button id="sbe-add" class="sbe-btn">+ Tambah Baris</button>
        <button id="sbe-run" class="sbe-btn sbe-btn-primary">Kirim Semua</button>
      </div>
      <pre id="sbe-log" style="display:none;"></pre>
    </div>
  `;
  document.body.appendChild(panel);

  const $ = (id) => panel.querySelector(id);
  const rowsBox = $('#sbe-rows');

  $('#sbe-toggle').onclick = () => {
    const b = $('#sbe-body');
    b.style.display = b.style.display === 'none' ? '' : 'none';
  };

  const log = (m) => {
    const el = $('#sbe-log');
    el.style.display = '';
    el.textContent += m + '\n';
    el.scrollTop = el.scrollHeight;
  };

  const opt = (v, t) => { const o = document.createElement('option'); o.value = v; o.textContent = t; return o; };

  function addRow() {
    const row = document.createElement('div');
    row.className = 'sbe-row';

    const kode = document.createElement('select');
    kode.appendChild(opt('', '-- Kode --'));
    kodeOptions.forEach(o => kode.appendChild(opt(o.value, o.text)));

    const kemasan = document.createElement('select');
    kemasan.disabled = true;
    kemasan.appendChild(opt('', '-- Kemasan --'));

    const tanggal = document.createElement('input');
    tanggal.type = 'date';
    tanggal.max = maxDate;
    if (minDate) tanggal.min = minDate;

    const jumlah = document.createElement('input');
    jumlah.type = 'text';
    jumlah.inputMode = 'decimal';
    jumlah.placeholder = '0,5';

    const status = document.createElement('select');
    status.appendChild(opt('', '-- Status --'));
    status.appendChild(opt('DISIMPAN', 'DISIMPAN'));
    status.appendChild(opt('TIDAK DISIMPAN', 'TIDAK DISIMPAN'));

    const del = document.createElement('button');
    del.textContent = '×';
    del.className = 'sbe-del';
    del.onclick = () => { if (rowsBox.children.length > 1) row.remove(); };

    kode.onchange = async () => {
      kemasan.disabled = true;
      kemasan.innerHTML = '';
      kemasan.appendChild(opt('', kode.value ? 'memuat...' : '-- Kemasan --'));
      if (!kode.value) return;
      const list = await fetchKemasan(kode.value);
      kemasan.innerHTML = '';
      if (!list) { kemasan.appendChild(opt('', '-- session habis, login ulang --')); return; }
      kemasan.appendChild(opt('', '-- Kemasan --'));
      list.forEach(o => kemasan.appendChild(opt(o.value, o.text)));
      kemasan.disabled = false;
    };

    row.append(kode, kemasan, tanggal, jumlah, status, del);
    row._fields = { kode, kemasan, tanggal, jumlah, status };
    rowsBox.appendChild(row);
  }

  async function saveRow(f) {
    const fd = new FormData();
    fd.append('form[id]', '');
    fd.append('form[id_daftar_limbah]', f.idLimbah);
    fd.append('form[id_kemasan]', f.idKemasan);
    fd.append('form[tanggal]', f.tanggal);
    fd.append('form[jumlah]', f.jumlah);
    fd.append('form[status]', f.status);
    const res = await fetch(BASE + '/save', { method: 'POST', body: fd, credentials: 'same-origin' });
    if (res.url.includes('/login')) return { loggedOut: true };
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const msg = (doc.querySelector('.flashMessage')?.getAttribute('data-msg') || '').trim();
    return { ok: res.ok && !/gagal/i.test(msg), status: res.status, msg };
  }

  $('#sbe-add').onclick = addRow;

  $('#sbe-run').onclick = async () => {
    const rows = [...rowsBox.children];
    const btn = $('#sbe-run');
    btn.disabled = true;
    log('=== Mulai ' + rows.length + ' baris ===');
    let ok = 0, fail = 0;
    for (let i = 0; i < rows.length; i++) {
      const f = rows[i]._fields;
      const n = i + 1;
      const jumlah = normJumlah(f.jumlah.value);
      const err = [];
      if (!f.kode.value) err.push('kode belum dipilih');
      if (!f.kemasan.value) err.push('kemasan belum dipilih');
      if (!f.tanggal.value) err.push('tanggal belum diisi');
      if (!jumlah) err.push('jumlah tidak valid');
      if (!f.status.value) err.push('status belum dipilih');
      if (err.length) { fail++; log('Baris ' + n + ': SKIP — ' + err.join('; ')); continue; }
      try {
        const res = await saveRow({
          idLimbah: f.kode.value, idKemasan: f.kemasan.value,
          tanggal: f.tanggal.value, jumlah, status: f.status.value,
        });
        if (res.loggedOut) throw 'session habis — login ulang lalu Kirim lagi';
        if (res.ok) { ok++; log('Baris ' + n + ': OK — ' + jumlah.replace('.', ',') + ' ton'); }
        else { fail++; log('Baris ' + n + ': GAGAL — ' + (res.msg || 'HTTP ' + res.status)); }
      } catch (e) {
        fail++; log('Baris ' + n + ': GAGAL — ' + e);
      }
    }
    log('=== Selesai: ' + ok + ' tersimpan, ' + fail + ' gagal. Refresh untuk lihat tabel. ===');
    btn.disabled = false;
  };

  addRow();
})();
