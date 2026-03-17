import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// ── Groq AI endpoint ──────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { messages, apiKey, max_tokens } = req.body

  console.log('────────────────────────────────────')
  console.log('API Key:', apiKey ? `✅ ${apiKey.slice(0, 8)}...` : '❌ MISSING')
  console.log('────────────────────────────────────')

  if (!apiKey) {
    return res.status(400).json({ error: { message: 'No API key received by server.' } })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: max_tokens || 700,
        messages
      })
    })

    const data = await response.json()
    console.log('Groq status:', response.status)

    if (data.error) {
      console.log('Groq error:', data.error.message)
      return res.status(400).json({ error: { message: data.error.message } })
    }

    const text = data.choices?.[0]?.message?.content ?? ''
    console.log('Groq replied ✅ length:', text.length)
    res.json({ choices: [{ message: { content: text } }] })

  } catch (err) {
    console.log('Server error:', err.message)
    res.status(500).json({ error: { message: err.message } })
  }
})

// ── Google TTS proxy endpoint ─────────────────────────────────────────────
app.get('/tts', async (req, res) => {
  const { text, lang } = req.query

  if (!text || !lang) {
    return res.status(400).send('Missing text or lang param')
  }

  console.log(`TTS request — lang: ${lang}, text: ${decodeURIComponent(text).slice(0, 40)}...`)

  try {
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${text}`

    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
        'Accept': 'audio/mpeg, audio/*'
      }
    })

    if (!response.ok) {
      console.log('Google TTS HTTP error:', response.status)
      return res.status(response.status).send('Google TTS failed')
    }

    const buffer = await response.arrayBuffer()
    console.log('TTS audio received ✅ bytes:', buffer.byteLength)

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.byteLength,
      'Cache-Control': 'no-cache'
    })
    res.send(Buffer.from(buffer))

  } catch (err) {
    console.log('TTS fetch error:', err.message)
    res.status(500).send('TTS error: ' + err.message)
  }
})

app.listen(3001, () => {
  console.log('✅ BhashaBridge backend running on http://localhost:3001')
})