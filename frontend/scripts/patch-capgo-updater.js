const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const candidates = [
  path.join(
    root,
    'node_modules',
    '@capgo',
    'capacitor-updater',
    'android',
    'src',
    'main',
    'java',
    'ee',
    'forgr',
    'capacitor_updater',
    'DelayUpdateUtils.java'
  ),
]

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return { patched: false, reason: 'missing' }
  const src = fs.readFileSync(filePath, 'utf8')
  const next = src.replace(/case\\s+DelayUntilNext\\./g, 'case ')
  if (next === src) return { patched: false, reason: 'nochange' }
  fs.writeFileSync(filePath, next, 'utf8')
  return { patched: true }
}

let any = false
for (const p of candidates) {
  const r = patchFile(p)
  if (r.patched) any = true
}

if (any) {
  process.stdout.write('patched @capgo/capacitor-updater\\n')
}
