import { saveRow } from './api.js';
import { createPanel, addRow, log } from './ui.js';
import { normJumlah } from './utils.js';

const kodeOptions = [...document.querySelectorAll('select[name="form[id_daftar_limbah]"] option')]
  .filter(o => o.value)
  .map(o => ({ value: o.value, text: o.textContent.trim().replace(/\s+/g, ' ') }));

const maxDate = new Date().toLocaleDateString('en-CA');
let minDate = '';
for (const s of document.querySelectorAll('script:not([src])')) {
  const m = s.textContent.match(/dateMin\s*=\s*'(\d{4}-\d{2}-\d{2})'/);
  if (m) { minDate = m[1]; break; }
}

const initData = { kodeOptions, maxDate, minDate };

const panel = createPanel();
addRow(initData);

panel.querySelector('#sbe-add').onclick = () => addRow(initData);

panel.querySelector('#sbe-run').onclick = async () => {
  const rows = [...panel.querySelector('#sbe-rows').children];
  const btn = panel.querySelector('#sbe-run');
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
