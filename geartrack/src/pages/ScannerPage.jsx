import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { ScanLine, X, Plus, FlipHorizontal, Camera, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'

const STATUS_STYLES = {
  in_stock: 'bg-green-100 text-green-700',
  sold: 'bg-blue-100 text-blue-700',
  repair: 'bg-yellow-100 text-yellow-700',
}

// Resize image to max 1024px and return base64 + mediaType
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => reject(new Error('Could not load image file'))
    img.onload = () => {
      const MAX = 1024
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX }
        else { width = Math.round((width * MAX) / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' })
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function ScannerPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('barcode') // 'barcode' | 'photo'

  // Barcode scanner state
  const [scanning, setScanning] = useState(false)
  const [looking, setLooking] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [cameras, setCameras] = useState([])
  const [cameraIndex, setCameraIndex] = useState(0)
  const scannerRef = useRef(null)

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY
  }

  // Photo scan state
  const [photoProcessing, setPhotoProcessing] = useState(false)
  const [photoResult, setPhotoResult] = useState(null)
  const [photoError, setPhotoError] = useState(null)
  const photoInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) scannerRef.current.stop().catch(() => {})
    }
  }, [])

  // ── Barcode scanner ──────────────────────────────────────────────

  const startScanner = async (index = cameraIndex, cameraList = cameras) => {
    setError(null)
    setResult(null)
    setScanning(true)
    await new Promise(r => setTimeout(r, 100))
    try {
      let list = cameraList
      if (list.length === 0) {
        list = await Html5Qrcode.getCameras()
        setCameras(list)
      }
      if (list.length === 0) { setScanning(false); setError('No camera found.'); return }
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      await scanner.start(
        list[index]?.id ?? list[0].id,
        { fps: 10, qrbox: { width: 250, height: 150 } },
        onScanSuccess,
        () => {}
      )
    } catch {
      setScanning(false)
      setError('Could not access camera. Please allow camera permission and try again.')
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) { await scannerRef.current.stop().catch(() => {}); scannerRef.current = null }
    setScanning(false)
  }

  const flipCamera = async () => {
    const next = (cameraIndex + 1) % cameras.length
    setCameraIndex(next)
    await stopScanner()
    await startScanner(next, cameras)
  }

  const onScanSuccess = async (decodedText) => {
    await stopScanner()
    setLooking(true)

    const { data, error: fetchError } = await supabase
      .from('computers').select('*').eq('serial_number', decodedText).maybeSingle()

    if (fetchError) { setLooking(false); setError('Lookup failed: ' + fetchError.message); return }

    if (data) { setLooking(false); setResult({ found: true, computer: data, scannedValue: decodedText, modelName: null }); return }

    let modelName = null
    try {
      const token = await getAuthHeader()
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lookup-serial?serial=${encodeURIComponent(decodedText)}`
      const res = await fetch(fnUrl, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) { const json = await res.json(); modelName = json.modelName ?? null }
    } catch { /* silent */ }

    setLooking(false)
    setResult({ found: false, computer: null, scannedValue: decodedText, modelName })
  }

  // ── Photo scan ───────────────────────────────────────────────────

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setPhotoError(null)
    setPhotoResult(null)
    setPhotoProcessing(true)

    try {
      const { base64, mediaType } = await resizeImage(file)
      const token = await getAuthHeader()
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-from-image`
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64, mediaType }),
      })
      if (!res.ok) throw new Error('Failed to analyse image')
      const data = await res.json()
      if (!data.model_name && !data.serial_number) {
        setPhotoError('Could not read any computer info from the image. Try a clearer photo of the label.')
      } else {
        setPhotoResult(data)
      }
    } catch (err) {
      setPhotoError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setPhotoProcessing(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-4 flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary">Scanner</h2>
        <p className="font-body text-sm text-text-muted mt-0.5">Scan or photograph a computer</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-background rounded-base p-1 gap-1">
        <button
          onClick={() => { setTab('barcode'); stopScanner(); setResult(null); setError(null) }}
          className={`flex-1 py-2 rounded-sm font-heading font-semibold text-sm transition-colors ${tab === 'barcode' ? 'bg-surface shadow text-primary' : 'text-text-muted'}`}
        >
          Barcode Scan
        </button>
        <button
          onClick={() => { setTab('photo'); stopScanner(); setResult(null); setError(null) }}
          className={`flex-1 py-2 rounded-sm font-heading font-semibold text-sm transition-colors ${tab === 'photo' ? 'bg-surface shadow text-primary' : 'text-text-muted'}`}
        >
          Photo Scan
        </button>
      </div>

      {/* ── BARCODE TAB ── */}
      {tab === 'barcode' && (
        <>
          {scanning && (
            <div className="relative">
              <div id="qr-reader" className="w-full rounded-base overflow-hidden" />
              <button onClick={stopScanner} aria-label="Close camera" className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5">
                <X size={18} />
              </button>
              {cameras.length > 1 && (
                <button onClick={flipCamera} aria-label="Switch camera" className="absolute top-2 left-2 bg-black/60 text-white rounded-full p-1.5">
                  <FlipHorizontal size={18} />
                </button>
              )}
            </div>
          )}

          {!scanning && !result && !looking && (
            <div className="bg-surface rounded-base shadow-sm flex flex-col items-center justify-center gap-4 py-16">
              <div className="bg-primary/10 p-5 rounded-xl">
                <ScanLine size={48} className="text-primary" strokeWidth={1.5} />
              </div>
              <p className="font-body text-text-muted text-sm text-center max-w-xs">
                Point the camera at a product barcode or QR code to look it up instantly.
              </p>
              <button onClick={() => startScanner()} className="bg-primary text-white font-heading font-semibold text-sm px-6 py-2.5 rounded-base hover:bg-primary-dark transition-colors">
                Open Camera
              </button>
            </div>
          )}

          {looking && (
            <div className="bg-surface rounded-base shadow-sm flex flex-col items-center justify-center gap-3 py-16">
              <p className="font-body text-text-muted text-sm">Looking up item...</p>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-base p-3 text-sm font-body">{error}</div>}

          {result && (
            <div className="flex flex-col gap-4">
              {result.found ? (
                <div className="bg-surface rounded-base border border-border p-4 flex flex-col gap-2">
                  <p className="font-heading font-semibold text-text">{result.computer.model_name}</p>
                  <p className="font-body text-xs text-text-muted">SN: {result.computer.serial_number}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-sm w-fit ${STATUS_STYLES[result.computer.status] ?? ''}`}>
                    {result.computer.status}
                  </span>
                  {result.computer.is_synced && <span className="text-xs text-primary font-semibold">✓ Synced</span>}
                </div>
              ) : (
                <div className="bg-surface rounded-base border border-border p-4 flex flex-col gap-3">
                  <p className="font-body text-sm text-text-muted">
                    No item found for <span className="font-semibold text-text">{result.scannedValue}</span>
                  </p>
                  {result.modelName && (
                    <p className="font-body text-sm text-green-700 bg-green-50 rounded px-3 py-2">
                      Detected: <span className="font-semibold">{result.modelName}</span>
                    </p>
                  )}
                  <button
                    onClick={() => navigate('/product/new', { state: { serial_number: result.scannedValue, model_name: result.modelName ?? '' } })}
                    className="flex items-center gap-2 bg-primary text-white font-heading font-semibold text-sm px-4 py-2.5 rounded-base hover:bg-primary-dark transition-colors w-fit"
                  >
                    <Plus size={16} /> Add this item
                  </button>
                </div>
              )}
              <button onClick={() => startScanner()} className="text-primary font-heading font-semibold text-sm underline text-left">
                Scan another
              </button>
            </div>
          )}
        </>
      )}

      {/* ── PHOTO TAB ── */}
      {tab === 'photo' && (
        <>
          {!photoProcessing && !photoResult && (
            <div className="bg-surface rounded-base shadow-sm flex flex-col items-center justify-center gap-4 py-16">
              <div className="bg-primary/10 p-5 rounded-xl">
                <Camera size={48} className="text-primary" strokeWidth={1.5} />
              </div>
              <p className="font-body text-text-muted text-sm text-center max-w-xs">
                Take a photo of the computer label or the back of the device. AI will read the model name and serial number automatically.
              </p>
              <label className="bg-primary text-white font-heading font-semibold text-sm px-6 py-2.5 rounded-base hover:bg-primary-dark transition-colors cursor-pointer">
                Take Photo
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
              <label className="text-primary font-heading font-semibold text-sm underline cursor-pointer">
                Upload from gallery
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
          )}

          {photoProcessing && (
            <div className="bg-surface rounded-base shadow-sm flex flex-col items-center justify-center gap-3 py-16">
              <Loader size={32} className="text-primary animate-spin" />
              <p className="font-body text-text-muted text-sm">Reading computer info from image...</p>
            </div>
          )}

          {photoError && (
            <div className="flex flex-col gap-4">
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-base p-3 text-sm font-body">{photoError}</div>
              <label className="text-primary font-heading font-semibold text-sm underline cursor-pointer text-left">
                Try another photo
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
          )}

          {photoResult && (
            <div className="flex flex-col gap-4">
              <div className="bg-surface rounded-base border border-border p-4 flex flex-col gap-3">
                <p className="font-heading font-semibold text-text">Detected from photo</p>
                {photoResult.manufacturer && (
                  <div className="flex flex-col gap-0.5">
                    <p className="font-body text-xs text-text-muted">Brand</p>
                    <p className="font-body text-sm text-text font-semibold">{photoResult.manufacturer}</p>
                  </div>
                )}
                {photoResult.model_name && (
                  <div className="flex flex-col gap-0.5">
                    <p className="font-body text-xs text-text-muted">Model</p>
                    <p className="font-body text-sm text-text font-semibold">{photoResult.model_name}</p>
                  </div>
                )}
                {photoResult.serial_number && (
                  <div className="flex flex-col gap-0.5">
                    <p className="font-body text-xs text-text-muted">Serial Number</p>
                    <p className="font-body text-sm text-text font-semibold">{photoResult.serial_number}</p>
                  </div>
                )}
                <button
                  onClick={() => navigate('/product/new', { state: { serial_number: photoResult.serial_number, model_name: photoResult.model_name } })}
                  className="flex items-center gap-2 bg-primary text-white font-heading font-semibold text-sm px-4 py-2.5 rounded-base hover:bg-primary-dark transition-colors w-fit mt-1"
                >
                  <Plus size={16} /> Add this item
                </button>
              </div>
              <label className="text-primary font-heading font-semibold text-sm underline cursor-pointer text-left">
                Try another photo
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
          )}
        </>
      )}
    </div>
  )
}
