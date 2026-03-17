import { useState, useRef, useCallback, useEffect } from 'react'
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
// ── Logo SVG inline (BhashaBridge) ─────────────────────────────────────────
const Logo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bridge arch */}
    <path d="M10 130 Q100 30 190 130" stroke="#1e3a6e" strokeWidth="10" fill="none" strokeLinecap="round"/>
    {/* Bridge vertical pillars */}
    {[60,80,100,120,140].map((x, i) => {
      const y = 130 - Math.sin(((x-10)/(190-10))*Math.PI) * 100 + 2
      return <line key={i} x1={x} y1={y} x2={x} y2="132" stroke="#1e3a6e" strokeWidth="5" strokeLinecap="round"/>
    })}
    {/* Bridge base */}
    <line x1="10" y1="132" x2="190" y2="132" stroke="#1e3a6e" strokeWidth="8" strokeLinecap="round"/>
    {/* Red dot at top */}
    <circle cx="100" cy="32" r="7" fill="#c0392b"/>
    {/* Circular arrows */}
    <path d="M65 160 A35 35 0 1 1 135 160" stroke="#c0392b" strokeWidth="6" fill="none"
      strokeLinecap="round" markerEnd="url(#rArrow)"/>
    <path d="M135 160 A35 35 0 1 1 65 160" stroke="#1e3a6e" strokeWidth="6" fill="none"
      strokeLinecap="round" markerEnd="url(#bArrow)"/>
    {/* Mic body */}
    <rect x="91" y="148" width="18" height="26" rx="9" fill="#1e3a6e"/>
    {/* Mic stand */}
    <path d="M100 174 Q100 182 100 184 M94 184 L106 184" stroke="#1e3a6e" strokeWidth="3"
      fill="none" strokeLinecap="round"/>
    <defs>
      <marker id="rArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M2 1L8 5L2 9" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
      </marker>
      <marker id="bArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M2 1L8 5L2 9" fill="none" stroke="#1e3a6e" strokeWidth="2" strokeLinecap="round"/>
      </marker>
    </defs>
  </svg>
)

// ── Data ────────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en-IN', name: 'English',   native: 'English',  tts: 'en',
    demo: 'I would like to know about home loan options' },
  { code: 'hi-IN', name: 'Hindi',     native: 'हिंदी',    tts: 'hi',
    demo: 'मुझे होम लोन के बारे में जानकारी चाहिए' },
  { code: 'ta-IN', name: 'Tamil',     native: 'தமிழ்',    tts: 'ta',
    demo: 'என் கணக்கில் எவ்வளவு பணம் இருக்கிறது?' },
  { code: 'te-IN', name: 'Telugu',    native: 'తెలుగు',   tts: 'te',
    demo: 'నాకు వ్యక్తిగత రుణం కావాలి' },
  { code: 'bn-IN', name: 'Bengali',   native: 'বাংলা',    tts: 'bn',
    demo: 'আমার অ্যাকাউন্ট খুলতে চাই' },
  { code: 'mr-IN', name: 'Marathi',   native: 'मराठी',    tts: 'mr',
    demo: 'माझ्या खात्यात किती पैसे आहेत?' },
  { code: 'gu-IN', name: 'Gujarati',  native: 'ગુજરાતી',  tts: 'gu',
    demo: 'મારે ફિક્સ્ડ ડિપોઝિટ ખોલવી છે' },
  { code: 'kn-IN', name: 'Kannada',   native: 'ಕನ್ನಡ',    tts: 'kn',
    demo: 'ನನ್ನ KYC ಅಪ್ಡೇಟ್ ಮಾಡಬೇಕು' },
  { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം',   tts: 'ml',
    demo: 'എനിക്ക് ഒരു പരാതി ഉണ്ട്' },
]

const INTENT_STYLES = {
  'Account Balance':  { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200'   },
  'Loan Inquiry':     { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200'  },
  'Account Opening':  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'Fund Transfer':    { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'Complaint':        { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-200'    },
  'KYC Update':       { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'Fixed Deposit':    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Other':            { bg: 'bg-gray-100',   text: 'text-gray-800',   border: 'border-gray-200'   },
}

const SENTIMENT_CONFIG = {
  Positive:   { emoji: '😊', bg: 'bg-green-100',  text: 'text-green-700',  bar: 'bg-green-400'  },
  Neutral:    { emoji: '😐', bg: 'bg-gray-100',   text: 'text-gray-700',   bar: 'bg-gray-400'   },
  Frustrated: { emoji: '😤', bg: 'bg-red-100',    text: 'text-red-700',    bar: 'bg-red-400'    },
  Confused:   { emoji: '😕', bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-400' },
}

const INTENT_ICONS = {
  'Account Balance':'💰','Loan Inquiry':'🏠','Account Opening':'📋',
  'Fund Transfer':'💸','Complaint':'⚠️','KYC Update':'🪪',
  'Fixed Deposit':'🏦','Other':'❓'
}

// ── Google TTS via server ──────────────────────────────────────────────────
function speakWithGoogleTTS(text, ttsLang, onStart, onEnd) {
  if (!text || !ttsLang) { onEnd?.(); return }
  const raw = text.match(/[^।\.!\?]+[।\.!\?]*/g) || [text]
  const chunks = []
  let current = ''
  for (const s of raw) {
    if ((current + s).length > 180) {
      if (current.trim()) chunks.push(current.trim())
      current = s
    } else { current += s }
  }
  if (current.trim()) chunks.push(current.trim())
  if (!chunks.length) { onEnd?.(); return }

  onStart?.()
  let index = 0
  const playNext = () => {
    if (index >= chunks.length) { onEnd?.(); return }
    const chunk = chunks[index++]
    const url = `${BASE}/tts?lang=${ttsLang}&text=${encodeURIComponent(chunk)}`
    const audio = new Audio(url)
    audio.onended = playNext
    audio.onerror = () => playNext()
    audio.play().catch(() => playNext())
  }
  playNext()
}

// ── Groq API ───────────────────────────────────────────────────────────────
async function callGroq(apiKey, systemPrompt, userPrompt, maxTokens = 700) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey, max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ]
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.choices[0].message.content.replace(/```json|```/g, '').trim()
}

// ── Analytics ──────────────────────────────────────────────────────────────
function buildAnalytics(conversation) {
  const langCount = {}, intentCount = {}
  const sentiments = { Positive: 0, Neutral: 0, Frustrated: 0, Confused: 0 }
  conversation.forEach(c => {
    langCount[c.language]   = (langCount[c.language]   || 0) + 1
    intentCount[c.intent]   = (intentCount[c.intent]   || 0) + 1
    if (sentiments[c.sentiment] !== undefined) sentiments[c.sentiment]++
  })
  const topIntent = Object.entries(intentCount).sort((a,b) => b[1]-a[1])[0]
  const topLang   = Object.entries(langCount).sort((a,b) => b[1]-a[1])[0]
  const total     = conversation.length
  const satisfactionScore = total === 0 ? 0 : Math.round(
    ((sentiments.Positive*1 + sentiments.Neutral*0.6 +
      sentiments.Confused*0.3 + sentiments.Frustrated*0) / total) * 100
  )
  return { langCount, intentCount, sentiments, topIntent, topLang, total, satisfactionScore }
}

function deriveConfidence(parsed) {
  let score = 70
  if (parsed.translation?.length > 10) score += 10
  if (parsed.intent && parsed.intent !== 'Other') score += 10
  if (parsed.sentiment) score += 5
  if (parsed.processSteps?.length >= 3) score += 5
  return Math.min(score, 98)
}

// ── Toast component ────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2
            transition-all duration-300 animate-slide-up
            ${t.type === 'success' ? 'bg-green-600 text-white'
            : t.type === 'error'   ? 'bg-red-600 text-white'
            : t.type === 'info'    ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-white'}`}>
          <span>{t.icon}</span><span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ── Confidence bar ─────────────────────────────────────────────────────────
function ConfidenceBar({ score }) {
  const color = score >= 85 ? 'bg-green-500' : score >= 65 ? 'bg-yellow-500' : 'bg-red-400'
  const label = score >= 85 ? 'High Confidence' : score >= 65 ? 'Medium Confidence' : 'Low Confidence'
  const textColor = score >= 85 ? 'bg-green-100 text-green-700' : score >= 65 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">AI Confidence</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${textColor}`}>
          {score}% — {label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

// ── Typing dots ────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0,1,2].map(i => (
        <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  )
}

// ── Analytics dashboard ────────────────────────────────────────────────────
function AnalyticsDashboard({ conversation }) {
  if (conversation.length === 0) return null
  const { langCount, intentCount, sentiments, topIntent, topLang, total, satisfactionScore } = buildAnalytics(conversation)
  return (
    <div className="mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">📊</span>
        <h3 className="font-bold text-gray-800">Branch Analytics</h3>
        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
          Live · Updates automatically
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { value: total, label: 'Customers Served', bg: 'bg-blue-50', border: 'border-blue-100', val: 'text-blue-700', lbl: 'text-blue-500' },
          { value: `${satisfactionScore}%`, label: 'Satisfaction', bg: 'bg-green-50', border: 'border-green-100', val: 'text-green-700', lbl: 'text-green-500' },
          { value: topLang?.[0] || '—', label: 'Top Language', bg: 'bg-purple-50', border: 'border-purple-100', val: 'text-purple-700', lbl: 'text-purple-500' },
          { value: topIntent?.[0] || '—', label: 'Top Request', bg: 'bg-orange-50', border: 'border-orange-100', val: 'text-orange-700', lbl: 'text-orange-500' },
        ].map(({ value, label, bg, border, val, lbl }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border ${border} text-center`}>
            <p className={`text-2xl font-bold ${val} leading-tight break-words`}>{value}</p>
            <p className={`text-xs ${lbl} mt-1 font-medium`}>{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Sentiment', items: Object.entries(sentiments), barClass: (k) => SENTIMENT_CONFIG[k]?.bar || 'bg-gray-400',
            label: (k) => `${SENTIMENT_CONFIG[k]?.emoji || ''} ${k}` },
          { title: 'Languages', items: Object.entries(langCount), barClass: () => 'bg-blue-400', label: (k) => k },
          { title: 'Request Types', items: Object.entries(intentCount), barClass: () => 'bg-purple-400',
            label: (k) => `${INTENT_ICONS[k] || '❓'} ${k}` },
        ].map(({ title, items, barClass, label }) => (
          <div key={title} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">{title}</p>
            <div className="space-y-2">
              {items.map(([k, count]) => {
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={k}>
                    <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                      <span className="truncate mr-2">{label(k)}</span>
                      <span className="font-medium flex-shrink-0">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${barClass(k)}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Session timer ──────────────────────────────────────────────────────────
function useSessionTimer(active) {
  const [seconds, setSeconds] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (active) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000)
    }
    return () => clearInterval(ref.current)
  }, [active])
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [apiKey,            setApiKey]           = useState('')
  const [apiKeySet,         setApiKeySet]         = useState(false)
  const [language,          setLanguage]          = useState(LANGUAGES[0])
  const [isListening,       setIsListening]       = useState(false)
  const [spokenText,        setSpokenText]        = useState('')
  const [isProcessing,      setIsProcessing]      = useState(false)
  const [result,            setResult]            = useState(null)
  const [confidence,        setConfidence]        = useState(0)
  const [isSpeaking,        setIsSpeaking]        = useState(false)
  const [conversation,      setConversation]      = useState([])
  const [summary,           setSummary]           = useState(null)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [error,             setError]             = useState('')
  const [activeTab,         setActiveTab]         = useState('translation')
  const [toasts,            setToasts]            = useState([])
  const [sessionActive,     setSessionActive]     = useState(false)
  const [showWelcome,       setShowWelcome]       = useState(true)

  const recognitionRef = useRef(null)
  const sessionTime = useSessionTimer(sessionActive)

  // ── Toast helper ─────────────────────────────────────────────────────────
  const toast = useCallback((message, type = 'info', icon = '💬') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, icon }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  // ── Speak ─────────────────────────────────────────────────────────────────
  const speakToCustomer = useCallback((text, ttsLang) => {
    speakWithGoogleTTS(text, ttsLang, () => setIsSpeaking(true), () => setIsSpeaking(false))
  }, [])

  // ── Process speech (shared by mic and demo mode) ──────────────────────────
  const processCustomerSpeech = useCallback(async (text) => {
    setIsProcessing(true)
    setResult(null)
    setConfidence(0)
    setError('')
    setActiveTab('translation')
    if (!sessionActive) setSessionActive(true)
    if (showWelcome) setShowWelcome(false)

    const systemPrompt = `You are a banking AI assistant for an Indian bank.
A customer is speaking in ${language.name}.
Return ONLY valid JSON — no markdown, no code fences, no explanation, nothing else before or after.
Exact JSON structure required:
{
  "translation": "accurate English translation of what the customer said",
  "intent": "exactly one of: Account Balance / Loan Inquiry / Account Opening / Fund Transfer / Complaint / KYC Update / Fixed Deposit / Other",
  "sentiment": "exactly one of: Positive / Neutral / Frustrated / Confused",
  "suggestedResponse": "a professional empathetic English response the bank staff should give",
  "processSteps": ["step 1 for staff", "step 2", "step 3"],
  "replyInCustomerLanguage": "the suggestedResponse fully translated into ${language.name} script"
}`

    try {
      const clean  = await callGroq(apiKey, systemPrompt, `Customer said in ${language.name}: "${text}"`, 700)
      const parsed = JSON.parse(clean)
      const score  = deriveConfidence(parsed)
      setConfidence(score)
      setResult(parsed)
      setConversation(prev => [...prev, {
        customerText: text, language: language.name,
        timestamp: new Date().toLocaleTimeString('en-IN'),
        confidence: score, ...parsed
      }])
      toast('Translation complete', 'success', '✅')
      speakToCustomer(parsed.replyInCustomerLanguage, language.tts)
    } catch (err) {
      setError('AI error: ' + err.message)
      toast('AI error — check terminal', 'error', '⚠️')
    } finally {
      setIsProcessing(false)
    }
  }, [language, apiKey, sessionActive, showWelcome, speakToCustomer, toast])

  // ── Start mic ─────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Please use Google Chrome'); return }
    const rec = new SR()
    rec.lang = language.code; rec.continuous = false; rec.interimResults = false
    rec.onstart  = () => { setIsListening(true); setError(''); toast(`Listening in ${language.name}...`, 'info', '🎙️') }
    rec.onend    = () => setIsListening(false)
    rec.onerror  = (e) => { setIsListening(false); setError('Mic error: ' + e.error) }
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setSpokenText(text)
      processCustomerSpeech(text)
    }
    recognitionRef.current = rec
    rec.start()
  }, [language, processCustomerSpeech, toast])

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false) }

  // ── Demo mode ─────────────────────────────────────────────────────────────
  const runDemo = useCallback(() => {
    const phrase = language.demo
    setSpokenText(phrase)
    toast(`Demo: ${language.name}`, 'info', '🎭')
    processCustomerSpeech(phrase)
  }, [language, processCustomerSpeech, toast])

  // ── Generate summary ──────────────────────────────────────────────────────
  const generateSummary = async () => {
    setGeneratingSummary(true); setError('')
    const systemPrompt = `You are a bank branch assistant. Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview of the entire interaction",
  "actionItems": ["action item 1", "action item 2", "action item 3"],
  "primaryConcern": "the main issue or request from the customer"
}`
    try {
      const clean  = await callGroq(apiKey, systemPrompt, JSON.stringify(conversation), 400)
      const parsed = JSON.parse(clean)
      setSummary(parsed)
      toast('Summary generated', 'success', '📄')
    } catch (err) {
      setError('Summary error: ' + err.message)
    } finally {
      setGeneratingSummary(false)
    }
  }

  // ── New session ───────────────────────────────────────────────────────────
  const newSession = () => {
    setConversation([]); setSummary(null); setResult(null)
    setSpokenText(''); setError(''); setSessionActive(false)
    setShowWelcome(true)
    toast('New session started', 'info', '🔄')
  }

  // ── Key screen ────────────────────────────────────────────────────────────
  if (!apiKeySet) {
    const isValidKey = apiKey.startsWith('gsk_') || apiKey.startsWith('AIza') || apiKey.startsWith('sk-')
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #0f2557 0%, #1e3a6e 50%, #2c5282 100%)' }}>
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex flex-col items-center mb-7">
            <Logo size={72} />
            <h1 className="text-2xl font-bold text-gray-900 mt-3 tracking-tight">BhashaBridge</h1>
            <p className="text-gray-400 text-sm mt-1">Speak Any Language. Bank Without Barriers.</p>
            <div className="flex gap-2 mt-3">
              {['hi','ta','te','bn','mr','gu','kn','ml'].map(l => (
                <span key={l} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{l}</span>
              ))}
            </div>
          </div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Groq API Key</label>
          <input
            type="password" value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && isValidKey && setApiKeySet(true)}
            placeholder="gsk_..."
            className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm mb-3 outline-none transition-colors"
          />
          {apiKey.length > 5 && !isValidKey && (
            <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
              <span>⚠️</span> Key should start with gsk_ — get free from console.groq.com
            </p>
          )}
          <button onClick={() => isValidKey && setApiKeySet(true)} disabled={!isValidKey}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold transition-all duration-200 mt-1 hover:shadow-lg">
            Launch BhashaBridge →
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">
            🔒 Key stays in your browser — never stored or sent elsewhere
          </p>
        </div>
      </div>
    )
  }

  const intentStyle = result ? (INTENT_STYLES[result.intent] || INTENT_STYLES['Other']) : null
  const sentimentCfg = result ? (SENTIMENT_CONFIG[result.sentiment] || SENTIMENT_CONFIG.Neutral) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,0.4)} 50%{box-shadow:0 0 0 12px rgba(59,130,246,0)} }
        .animate-fade-in { animation: fadeIn 0.35s ease-out }
        .animate-slide-up { animation: slideUp 0.3s ease-out }
        .mic-ready { animation: pulse-ring 2s ease-in-out infinite }
      `}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(90deg, #0f2557 0%, #1e3a6e 100%)' }}
        className="text-white px-5 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Logo size={38} />
          <div>
            <h1 className="text-base font-bold leading-none tracking-tight">BhashaBridge</h1>
            <p className="text-blue-300 text-xs mt-0.5">Speak Any Language. Bank Without Barriers.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSpeaking && (
            <span className="bg-blue-700 text-xs px-3 py-1.5 rounded-full animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
              Speaking to customer
            </span>
          )}
          {sessionActive && (
            <span className="text-xs text-blue-300 font-mono bg-blue-900 px-2.5 py-1 rounded-lg">
              ⏱ {sessionTime}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-200">Groq · Live</span>
          </div>
          {conversation.length > 0 && (
            <button onClick={newSession}
              className="text-xs bg-blue-800 hover:bg-blue-700 text-blue-200 px-3 py-1.5 rounded-lg transition">
              + New Session
            </button>
          )}
          <button onClick={() => { setApiKeySet(false); setApiKey('') }}
            className="text-xs text-blue-400 hover:text-white transition ml-1">
            Change Key
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-5">

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm flex gap-2 animate-fade-in">
            <span>⚠️</span><span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── Customer Panel ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm">👤</div>
              <h2 className="font-bold text-gray-800">Customer</h2>
              <span className="ml-auto text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full font-medium">
                Speaks their language
              </span>
            </div>

            {/* Language selector */}
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">Select Language</p>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {LANGUAGES.map(lang => (
                <button key={lang.code}
                  onClick={() => { setLanguage(lang); setSpokenText(''); setResult(null); setError('') }}
                  className={`py-2.5 px-1 rounded-xl text-xs font-medium border transition-all duration-200 ${
                    language.code === lang.code
                      ? 'bg-blue-700 text-white border-blue-700 shadow-md scale-105'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-102'
                  }`}>
                  <div className="text-base">{lang.native}</div>
                  <div className="opacity-70 mt-0.5">{lang.name}</div>
                </button>
              ))}
            </div>

            {/* Mic + Demo */}
            <div className="flex flex-col items-center py-4">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500 scale-110 shadow-2xl shadow-red-200'
                    : isProcessing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800 hover:scale-105 shadow-xl shadow-blue-200 mic-ready'
                }`}>
                {isListening ? '⏹' : isProcessing ? '⏳' : '🎙️'}
              </button>

              <p className="mt-3 text-sm text-gray-500 text-center font-medium">
                {isListening   ? <span className="text-red-500">Listening in {language.name}...</span>
                 : isProcessing ? <span className="text-blue-500">AI is processing...</span>
                 : `Tap to speak in ${language.name}`}
              </p>

              {isListening && (
                <div className="flex gap-1 mt-2 items-end">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-1.5 bg-red-400 rounded-full animate-bounce"
                      style={{ height:`${8 + Math.sin(i)*8 + 8}px`, animationDelay:`${i*0.08}s` }} />
                  ))}
                </div>
              )}

              {isProcessing && (
                <div className="mt-2">
                  <TypingDots />
                </div>
              )}

              {/* Demo mode button */}
              {!isListening && !isProcessing && (
                <button onClick={runDemo}
                  className="mt-3 text-xs bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-200 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5">
                  <span>🎭</span> Demo Mode — Try {language.name}
                </button>
              )}
            </div>

            {/* What customer said */}
            {spokenText && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-2 animate-fade-in">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <p className="text-xs text-gray-400 font-medium">Customer said in {language.name}</p>
                </div>
                <p className="text-gray-800 font-medium text-base leading-relaxed">{spokenText}</p>
              </div>
            )}

            {/* Welcome / quick start */}
            {showWelcome && !spokenText && (
              <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100 animate-fade-in">
                <p className="text-xs text-blue-600 font-semibold mb-2">💡 Quick Start</p>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Select the customer's language above</li>
                  <li>2. Tap the mic and speak, or click Demo Mode</li>
                  <li>3. Staff sees instant English translation</li>
                  <li>4. AI speaks the reply back in customer's language</li>
                </ol>
              </div>
            )}
          </div>

          {/* ── Staff Panel ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">👩‍💼</div>
              <h2 className="font-bold text-gray-800">Bank Staff</h2>
              <span className="ml-auto text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                English Interface
              </span>
            </div>

            {/* Tabs */}
            {result && !isProcessing && (
              <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
                {['translation', 'guidance'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {tab === 'translation' ? '🌐 Translation' : '📋 Staff Guidance'}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!result && !isProcessing && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                <Logo size={64} />
                <p className="text-sm mt-4 text-gray-400 font-medium">Ready for customer interaction</p>
                <p className="text-xs mt-1 text-gray-300">AI translation appears here instantly</p>
              </div>
            )}

            {/* Processing */}
            {isProcessing && (
              <div className="flex flex-col items-center justify-center h-64 text-blue-400">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-semibold text-gray-700">Translating and analysing...</p>
                <p className="text-xs text-gray-400 mt-1">Powered by Groq · Llama 3.3 70B</p>
                <TypingDots />
              </div>
            )}

            {/* Result */}
            {result && !isProcessing && (
              <div className="space-y-3 animate-fade-in">
                <ConfidenceBar score={confidence} />

                <div className="flex gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${intentStyle.bg} ${intentStyle.text} ${intentStyle.border}`}>
                    {INTENT_ICONS[result.intent] || '❓'} {result.intent}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sentimentCfg.bg} ${sentimentCfg.text}`}>
                    {sentimentCfg.emoji} {result.sentiment}
                  </span>
                </div>

                {activeTab === 'translation' && (
                  <>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1.5">
                        Customer said (English)
                      </p>
                      <p className="text-gray-800 text-sm leading-relaxed">{result.translation}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1.5">
                        Suggested staff response
                      </p>
                      <p className="text-gray-800 text-sm leading-relaxed">{result.suggestedResponse}</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">
                          AI speaks to customer ({language.name})
                        </p>
                        <button
                          onClick={() => { speakToCustomer(result.replyInCustomerLanguage, language.tts); toast('Playing audio...', 'info', '🔊') }}
                          className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full transition font-semibold shadow-sm flex items-center gap-1">
                          🔊 Replay
                        </button>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed">{result.replyInCustomerLanguage}</p>
                    </div>
                  </>
                )}

                {activeTab === 'guidance' && result.processSteps?.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-3">
                      Step-by-step process guidance
                    </p>
                    <ol className="space-y-2.5">
                      {result.processSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                          <span className="bg-purple-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Analytics */}
        <AnalyticsDashboard conversation={conversation} />

        {/* Conversation log */}
        {conversation.length > 0 && (
          <div className="mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                📋 Conversation Log
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                  {conversation.length} exchange{conversation.length > 1 ? 's' : ''}
                </span>
              </h3>
              <button onClick={generateSummary} disabled={generatingSummary}
                className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm">
                {generatingSummary
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Generating...</>
                  : '📄 Generate Summary'}
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {conversation.map((entry, i) => {
                const is = INTENT_STYLES[entry.intent] || INTENT_STYLES['Other']
                return (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 hover:bg-blue-50 rounded-xl px-4 py-2.5 text-sm transition-colors">
                    <span className="text-blue-500 font-bold w-5 text-center text-xs">{i + 1}</span>
                    <span className="text-blue-600 font-semibold text-xs">[{entry.language}]</span>
                    <span className="text-gray-600 flex-1 truncate">{entry.customerText}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{entry.timestamp}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${is.bg} ${is.text}`}>
                      {entry.intent}
                    </span>
                  </div>
                )
              })}
            </div>

            {summary && (
              <div className="mt-5 pt-5 border-t border-gray-100 animate-fade-in">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  📊 Branch Interaction Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { title: 'Overview', content: <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>, bg: 'bg-blue-50', border: 'border-blue-100', titleColor: 'text-blue-500' },
                    { title: 'Action Items', content: (
                      <ul className="space-y-1.5">
                        {summary.actionItems?.map((item, i) => (
                          <li key={i} className="text-xs text-gray-700 flex gap-1.5 items-start">
                            <span className="text-green-500 flex-shrink-0 font-bold">✓</span>{item}
                          </li>
                        ))}
                      </ul>
                    ), bg: 'bg-green-50', border: 'border-green-100', titleColor: 'text-green-600' },
                    { title: 'Branch Record', content: (
                      <div className="space-y-1">
                        {[
                          ['Language', conversation[0]?.language],
                          ['Concern', summary.primaryConcern],
                          ['Exchanges', conversation.length],
                          ['Duration', sessionTime],
                          ['Date', new Date().toLocaleDateString('en-IN')],
                        ].map(([k, v]) => (
                          <p key={k} className="text-xs text-gray-600">
                            <span className="font-semibold">{k}:</span> {v}
                          </p>
                        ))}
                      </div>
                    ), bg: 'bg-purple-50', border: 'border-purple-100', titleColor: 'text-purple-500' },
                  ].map(({ title, content, bg, border, titleColor }) => (
                    <div key={title} className={`${bg} rounded-xl p-4 border ${border}`}>
                      <p className={`text-xs ${titleColor} font-semibold uppercase tracking-wide mb-2`}>{title}</p>
                      {content}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400 pb-4">
          BhashaBridge · Powered by Groq (Llama 3.3 70B) · Google TTS · iDEA 2.0 Hackathon 2025
        </div>
      </div>

      <Toast toasts={toasts} />
    </div>
  )
}