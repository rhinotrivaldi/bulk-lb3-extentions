function normJumlah(s) {
  s = String(s).trim().replace(/\s/g, '');
  if (!/^\d+([.,]\d+)?$/.test(s)) return null;
  return s.replace(',', '.');
}

if (typeof module !== 'undefined') {
  module.exports = { normJumlah };
}
