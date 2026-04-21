const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const outDir = path.resolve(process.env.STATIC_DIR || path.join(__dirname, '..', 'out'))
const port = Number(process.env.PORT || 4173)

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
}

function safeJoin(base, requestPath) {
  const withoutLeading = requestPath.replace(/^\/+/, '')
  const normalized = path.normalize(withoutLeading).replace(/^(\.\.(\/|\\|$))+/, '')
  return path.join(base, normalized)
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase()
  res.statusCode = 200
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  res.setHeader('Content-Type', mime[ext] || 'application/octet-stream')
  fs.createReadStream(filePath).pipe(res)
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.statusCode = 400
    res.end('Bad Request')
    return
  }

  const parsed = url.parse(req.url)
  const pathname = decodeURIComponent(parsed.pathname || '/')
  let filePath = safeJoin(outDir, pathname)

  try {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')

    const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null
    const isDir = !!(stat && stat.isDirectory())
    if (isDir) {
      const indexCandidate = path.join(filePath, 'index.html')
      if (fs.existsSync(indexCandidate) && fs.statSync(indexCandidate).isFile()) {
        sendFile(res, indexCandidate)
        return
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      sendFile(res, filePath)
      return
    }

    const ext = path.extname(pathname)
    if (!ext) {
      const withoutSlash = pathname === '/' ? '/index' : pathname.replace(/\/$/, '')
      const htmlCandidate = safeJoin(outDir, withoutSlash + '.html')
      if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
        sendFile(res, htmlCandidate)
        return
      }
    }

    const indexHtml = path.join(outDir, 'index.html')
    if (fs.existsSync(indexHtml)) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      fs.createReadStream(indexHtml).pipe(res)
      return
    }

    res.statusCode = 404
    res.end('Not Found')
  } catch {
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

server.listen(port, '0.0.0.0', () => {
  process.stdout.write(`Serving ${outDir} on http://localhost:${port}\n`)
})
