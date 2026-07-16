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
#sbe-panel{position:fixed;bottom:12px;right:12px;z-index:99999;background:#fff;border:1px solid #bbb;border-radius:8px;padding:12px;width:680px;box-shadow:0 4px 16px rgba(0,0,0,.25);font:12px/1.4 Consolas,monospace;color:#222}
#sbe-panel *{box-sizing:border-box}
#sbe-panel select,#sbe-panel input,#sbe-panel button{all:revert;font:12px/1.4 Consolas,monospace}
#sbe-panel .sbe-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
#sbe-panel .sbe-x{border:none;background:none;cursor:pointer}
#sbe-panel .sbe-row{display:grid;grid-template-columns:1fr 1fr 132px 72px 116px 22px;gap:4px;margin-bottom:4px;align-items:center}
#sbe-panel .sbe-row select,#sbe-panel .sbe-row input{width:100%;min-width:0}
#sbe-panel .sbe-del{border:none;background:none;cursor:pointer;font-size:16px;padding:0}
#sbe-panel .sbe-btn{padding:3px 12px;cursor:pointer;margin-right:6px}
#sbe-panel #sbe-log{max-height:180px;overflow:auto;background:#f4f4f4;padding:8px;margin:8px 0 0;white-space:pre-wrap}`;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.id = 'sbe-panel';
  panel.innerHTML =
    '<div class="sbe-head"><b>Bulk Entry LB3</b><button id="sbe-toggle" class="sbe-x">&#9660;</button></div>' +
    '<div id="sbe-body">' +
    '<div id="sbe-rows"></div>' +
    '<button id="sbe-add" class="sbe-btn">+ tambah baris</button>' +
    '<button id="sbe-run" class="sbe-btn">Kirim semua</button>' +
    '<pre id="sbe-log"></pre>' +
    '</div>';
  document.body.appendChild(panel);

  const $ = (id) => panel.querySelector(id);
  const rowsBox = $('#sbe-rows');

  $('#sbe-toggle').onclick = () => {
    const b = $('#sbe-body');
    b.style.display = b.style.display === 'none' ? '' : 'none';
  };

  const log = (m) => {
    const el = $('#sbe-log');
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
