export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { text, lang } = req.query
  if (!text || !lang) return res.status(400).send('Missing text or lang')

  try {
    const googleUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=${lang}&client=gtx&q=${text}`

    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Referer': 'https://translate.google.com/',
        'Accept': 'audio/mpeg, audio/*'
      }
    })

    if (!response.ok) return res.status(response.status).send('TTS failed')

    const buffer = await response.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send(Buffer.from(buffer))

  } catch (err) {
    res.status(500).send('TTS error: ' + err.message)
  }
}
