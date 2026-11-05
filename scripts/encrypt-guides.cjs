// Run locally with PDF_ENCRYPTION_KEY (64 hex characters); never commit that key.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
if (!/^[a-f0-9]{64}$/i.test(process.env.PDF_ENCRYPTION_KEY || '')) throw new Error('Set PDF_ENCRYPTION_KEY to 64 hex characters');
const key = Buffer.from(process.env.PDF_ENCRYPTION_KEY, 'hex');
for (const [lang, source] of [['de', process.argv[2]], ['en', process.argv[3]]]) {
  const pdf = fs.readFileSync(source);
  if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('Expected PDF');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(pdf), cipher.final()]);
  fs.writeFileSync(path.join(__dirname, '..', 'private-products', `longevity-${lang}.enc`), Buffer.concat([iv, cipher.getAuthTag(), ciphertext]));
}
console.log('Both guides encrypted. Keep the key outside Git.');
