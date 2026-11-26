// Reads hosts.txt (one https://domain per line, # = comment), writes the signed hosts.json.
// The private key stays in secret/ on this PC only (never pushed).
import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const lines = readFileSync(join(dir, 'hosts.txt'), 'utf8').split(/\r?\n/);
const hosts = [];
for (let l of lines) {
  l = l.replace(/#.*/, '').trim().toLowerCase().replace(/\/+$/, '');
  if (!l) continue;
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(l.replace(/^https:\/\//, ''))) {
    console.error('هوست غلط: ' + l); process.exit(1);
  }
  if (!l.startsWith('https://')) l = 'https://' + l;
  if (!hosts.includes(l)) hosts.push(l);
}
if (!hosts.length) { console.error('القائمة فاضية — لازم هوست واحد على الأقل'); process.exit(1); }
if (hosts.length > 8) { console.error('الحد 8 هوستات'); process.exit(1); }

const ts = Math.floor(Date.now() / 1000);
const msg = 'majed-hosts\n' + ts + '\n' + hosts.join('\n');
const key = createPrivateKey(readFileSync(join(dir, 'secret', 'hosts-sign.pem')));
const sig = sign('sha256', Buffer.from(msg), key).toString('base64');
const pub = createPublicKey(key);
if (!verify('sha256', Buffer.from(msg), pub, Buffer.from(sig, 'base64'))) throw new Error('verify failed');

writeFileSync(join(dir, 'hosts.json'), JSON.stringify({ v: 1, ts, hosts, sig }, null, 1) + '\n');
console.log('تم التوقيع:\n  ' + hosts.join('\n  '));
