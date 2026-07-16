const assert = require('assert');
const { normJumlah } = require('./parse');

assert.equal(normJumlah('0,5'), '0.5');
assert.equal(normJumlah('2.0525'), '2.0525');
assert.equal(normJumlah('12'), '12');
assert.equal(normJumlah(' 0,01 '), '0.01');
assert.equal(normJumlah('abc'), null);
assert.equal(normJumlah(''), null);
assert.equal(normJumlah('1,2,3'), null);

console.log('all parse tests passed');
