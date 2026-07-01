'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, Image as ImageIcon, Check, AlertCircle, Loader2 } from 'lucide-react'
import { adminService } from '@/services/adminService'

export default function AdminLogoPage() {
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    adminService.getSiteLogo().then(url => { if (url) setCurrentLogo(url) }).catch(() => {})
  }, [])

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setMsg({ type: 'error', text: 'Only image files allowed.' }); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setMsg(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setMsg(null)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const url = await adminService.uploadLogo(formData)
      setCurrentLogo(url)
      setPreview(null)
      setFile(null)
      setMsg({ type: 'success', text: 'Logo uploaded successfully! Navbar will reflect the new logo.' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Site Logo</h1>
        <p className="text-slate-400 text-sm">Upload your logo to display in the navbar and as the site icon.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
          <h2 className="font-rajdhani font-bold text-white text-lg mb-4">Upload New Logo</h2>
          <div
            className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center cursor-pointer hover:border-saffron/40 transition-colors"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-32 mx-auto object-contain rounded-xl" />
            ) : (
              <>
                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-300 font-medium mb-1">Drag & drop or click to select</p>
                <p className="text-slate-500 text-sm">PNG, SVG, JPG · Max 5MB · Recommended: 512×512</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

          {file && (
            <p className="text-slate-400 text-xs mt-2">{file.name} · {(file.size / 1024).toFixed(1)} KB</p>
          )}

          {msg && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msg.text}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 w-full btn-primary py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Logo</>}
          </button>
        </motion.div>

        {/* Current logo */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
          <h2 className="font-rajdhani font-bold text-white text-lg mb-4">Current Logo</h2>
          {currentLogo ? (
            <div className="space-y-4">
              <div className="bg-dark-800 rounded-xl p-6 flex items-center justify-center">
                <img src={currentLogo} alt="Current Logo" className="max-h-32 object-contain" />
              </div>
              <div className="bg-dark-900 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={currentLogo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-rajdhani font-black text-xl" style={{ background: 'linear-gradient(135deg,#FF6B2B,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EsportsG</span>
                <span className="text-slate-500 text-xs ml-auto">Navbar preview</span>
              </div>
              <p className="text-slate-500 text-xs break-all">{currentLogo}</p>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500">
              <ImageIcon className="w-10 h-10 mb-2" />
              <p className="text-sm">No custom logo uploaded yet.</p>
              <p className="text-xs mt-1">Using default SVG logo.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
