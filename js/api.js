export const BASE = '/siraja-2024/lb3/dihasilkan';

const kemasanCache = {};

export async function fetchKemasan(id) {
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

export async function saveRow(f) {
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