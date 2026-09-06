import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prescriptionService } from '../services/api'
import api from '../services/api'
import { Pill, Upload, X, FileImage, Loader } from 'lucide-react'

export default function PrescriptionInput() {

  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Convert file to base64 string
  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (err) => reject(err)
    })
  }

  // Handle image upload and OCR
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Please upload an image under 5MB.')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)')
      return
    }

    setImageFile(file)
    setError('')
    setOcrLoading(true)
    setText('') // Clear old text while scanning

    // Show preview
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    try {
      // Step 1: Convert image to base64
      const base64 = await toBase64(file)

      // Step 2: Send to backend OCR endpoint
      // base64 looks like "data:image/png;base64,XXXX..." — we only send the XXXX part
      const res = await api.post('/prescriptions/ocr', {
        image_base64: base64.split(',')[1]
      })

      // Step 3: Fill the textarea with the transcribed text
      setText(res.data.transcribed_text)
      setError('')

    } catch (err) {
      console.error('OCR error:', err)
      const detail = err.response?.data?.detail || ''
      setError(
        detail.includes('connect')
          ? 'Cannot reach ML service. Make sure ml_service is running on port 8003.'
          : 'Could not read prescription. Try a clearer photo or type the prescription manually below.'
      )
    } finally {
      setOcrLoading(false)
    }
  }

  // Remove the uploaded image
  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setText('')
    setError('')
  }

  // Submit prescription text for full explanation
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!text.trim() || text.trim().length < 5) {
      setError('Please enter or scan your prescription details first.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await prescriptionService.explain(text)
      navigate(`/prescription/result/${res.data.id}`, { state: { result: res.data } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Page Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <Pill className="w-5 h-5 text-teal-400" />
          <h1 className="font-display text-2xl font-bold text-white dark:text-white text-slate-900">
            Prescription Explainer
          </h1>
        </div>
        <p className="text-slate-400 dark:text-slate-400 text-slate-500 text-sm">
          Upload a photo of your prescription or type it below — we'll explain every medicine in plain English.
        </p>
      </div>

      {/* Upload Area */}
      <div className="card p-5 mb-5 animate-fade-up stagger-1">
        <p className="label mb-3">
          <FileImage className="w-4 h-4 inline mr-1.5 text-teal-400" />
          Step 1 — Upload Prescription Photo (optional)
        </p>

        {!imageFile ? (
          /* Drag-and-drop style upload zone */
          <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-700 dark:border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/60 hover:bg-teal-500/5 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-slate-800 dark:bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-teal-500/10 group-hover:border-teal-500/40 transition-all">
              <Upload className="w-5 h-5 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-300 dark:text-slate-300">
                Click to upload prescription photo
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Works with handwritten prescriptions, printed reports, hospital discharge papers
              </p>
              <p className="text-xs text-slate-600 mt-1">JPG, PNG, WEBP — max 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        ) : (
          /* Image preview with remove button */
          <div className="relative">
            <div className="flex items-start gap-4 p-4  rounded-xl border border-slate-700">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Prescription preview"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-700 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{imageFile.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(imageFile.size / 1024).toFixed(0)} KB
                </p>
                {ocrLoading ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                    <span className="text-xs text-teal-400">Reading prescription...</span>
                  </div>
                ) : text ? (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full"></div>
                    <span className="text-xs text-teal-400">Prescription read successfully</span>
                  </div>
                ) : null}
              </div>
              <button
                onClick={clearImage}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-colors flex-shrink-0"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Text Area + Submit */}
      <div className="card p-6 animate-fade-up stagger-2">
        <label className="label text-base mb-3">
          Step 2 — Review & Submit
          {ocrLoading && (
            <span className="ml-2 text-xs text-teal-400 font-normal animate-pulse">
              Scanning image...
            </span>
          )}
        </label>

        <textarea
          className="input-field resize-none text-sm leading-relaxed font-mono mb-1"
          rows={8}
          value={ocrLoading ? '' : text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            ocrLoading
              ? 'Reading your prescription...'
              : 'Your prescription text will appear here after scanning.\nYou can also type or paste it directly.\n\nExample:\nAmoxicillin 500mg - 3 times daily for 7 days\nIbuprofen 400mg - every 8 hours with food'
          }
          disabled={ocrLoading}
        />

        {text && !ocrLoading && (
          <p className="text-xs text-slate-500 mb-3">
            ✏️ You can edit the text above before explaining — fix any misread words from the scan.
          </p>
        )}

        {error && (
          <div className="text-red-400 text-sm mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || ocrLoading || !text.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Analyzing prescription...
            </>
          ) : (
            <>
              <Pill className="w-4 h-4" />
              Explain Prescription
            </>
          )}
        </button>
      </div>

      {/* Help note */}
      <p className="text-center text-xs text-slate-600 mt-4">
        Works with handwritten doctor prescriptions, printed reports, and hospital discharge summaries
      </p>
    </div>
  )
}
