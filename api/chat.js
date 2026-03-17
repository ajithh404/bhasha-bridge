export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { messages, apiKey, max_tokens } = req.body

  if (!apiKey) {
    return res.status(400).json({ error: { message: 'No API key received.' } })
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
    if (data.error) return res.status(400).json({ error: { message: data.error.message } })

    const text = data.choices?.[0]?.message?.content ?? ''
    res.json({ choices: [{ message: { content: text } }] })

  } catch (err) {
    res.status(500).json({ error: { message: err.message } })
  }
}