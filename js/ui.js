import { fetchKemasan } from './api.js';

let panel;
const $ = (sel) => panel.querySelector(sel);

export function createPanel() {
  panel = document.createElement('div');
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
  $('#sbe-toggle').onclick = togglePanel;
  return panel;
}

function togglePanel() {
  const b = $('#sbe-body');
  b.style.display = b.style.display === 'none' ? '' : 'none';
}

export function log(m) {
  const el = $('#sbe-log');
  el.style.display = '';
  el.textContent += m + '\n';
  el.scrollTop = el.scrollHeight;
}

const opt = (v, t) => { const o = document.createElement('option'); o.value = v; o.textContent = t; return o; };

const renumber = (rowsBox) => [...rowsBox.children].forEach((r, i) => { r.firstChild.textContent = i + 1; });

export function addRow({ kodeOptions, maxDate, minDate }) {
  const rowsBox = $('#sbe-rows');
  const row = document.createElement('div');
  row.className = 'sbe-row';

  const num = document.createElement('span');
  num.className = 'sbe-num';

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
  del.onclick = () => { if (rowsBox.children.length > 1) { row.remove(); renumber(rowsBox); } };

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

  row.append(num, kode, kemasan, tanggal, jumlah, status, del);
  row._fields = { kode, kemasan, tanggal, jumlah, status };
  rowsBox.appendChild(row);
  renumber(rowsBox);
}