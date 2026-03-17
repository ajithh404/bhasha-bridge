export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { text, lang } = req.query
  if (!text || !lang) return res.status(400).send('Missing text or lang')

  try {
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${text}`

    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
        'Accept': 'audio/mpeg, audio/*'
      }
    })

    if (!response.ok) return res.status(response.status).send('Google TTS failed')

    const buffer = await response.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-cache')
    res.send(Buffer.from(buffer))

  } catch (err) {
    res.status(500).send('TTS error: ' + err.message)
  }
}