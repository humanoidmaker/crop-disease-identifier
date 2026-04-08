import { useState, useRef, useCallback } from 'react';
import api from '../utils/api';
import { Upload, Camera, X, AlertTriangle, Loader2, Pill, Shield } from 'lucide-react';

interface PredictionResult {
  prediction_id: string;
  top_prediction: string;
  confidence: number;
  severity: string;
  treatment: string;
  prevention: string[];
  affected_crops: string;
  all_predictions: { condition: string; confidence: number }[];
  device: string;
  disclaimer: string;
}

export default function Scan() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP)');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/predict/crop', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 50));
        },
      });
      setProgress(100);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Identification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setError('Camera access denied or not available.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const f = new File([blob], 'leaf-capture.jpg', { type: 'image/jpeg' });
        handleFile(f);
      }
    }, 'image/jpeg', 0.9);
    closeCamera();
  };

  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    }
    setCameraOpen(false);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setProgress(0);
  };

  const severityColor = (s: string) => s === 'Low' ? 'bg-green-100 text-green-700 border-green-300' : s === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-red-100 text-red-700 border-red-300';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Crop Disease Scan</h1>

      {cameraOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
          <video ref={videoRef} className="max-w-full max-h-[70vh] rounded-xl" />
          <div className="flex gap-4 mt-4">
            <button onClick={capturePhoto} className="bg-white text-slate-800 px-6 py-3 rounded-xl font-medium hover:bg-slate-100">Capture</button>
            <button onClick={closeCamera} className="bg-red-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600">Cancel</button>
          </div>
        </div>
      )}

      {!result && (
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-white'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img src={preview} alt="Leaf Preview" className="max-h-64 rounded-xl shadow-md mx-auto" />
                <button onClick={reset} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-500">{file?.name} ({((file?.size || 0) / 1024).toFixed(0)} KB)</p>
              {loading ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-primary-700">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">{progress < 50 ? 'Uploading...' : 'Identifying disease...'}</span>
                  </div>
                  <div className="w-64 mx-auto bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-primary-600 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : (
                <button onClick={handleUpload} className="bg-primary-700 text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-800 transition-colors">
                  Identify Disease
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-slate-700">Drop your leaf photo here</p>
                <p className="text-sm text-slate-500 mt-1">Clear photo of the affected leaf for best results</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => fileRef.current?.click()} className="bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-800 transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
                <button onClick={openCamera} className="bg-slate-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>
              </div>
              <p className="text-xs text-slate-400">Supports JPG, PNG, WebP. Max 10MB.</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Disease name + confidence */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{result.top_prediction}</h2>
                <p className="text-sm text-slate-500 mt-1">Affected Crops: {result.affected_crops}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${severityColor(result.severity)}`}>
                {result.severity} Severity
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Confidence</span>
                <span className="font-semibold text-slate-800">{result.confidence}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${result.confidence >= 75 ? 'bg-red-500' : result.confidence >= 50 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${result.confidence}%` }} />
              </div>
            </div>
          </div>

          {/* Treatment card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary-700" />
              Treatment
            </h3>
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <p className="text-primary-900 text-sm leading-relaxed">{result.treatment}</p>
            </div>
          </div>

          {/* Prevention tips */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Prevention Tips
            </h3>
            <ul className="space-y-2">
              {result.prevention.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* All predictions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">All Predictions</h3>
            <div className="space-y-3">
              {result.all_predictions.map((p) => (
                <div key={p.condition} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 w-36 flex-shrink-0">{p.condition}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                    <div className="bg-primary-500 h-full rounded-full flex items-center justify-end px-2 min-w-[2rem]" style={{ width: `${Math.max(p.confidence, 3)}%` }}>
                      <span className="text-xs font-medium text-white">{p.confidence}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm">{result.disclaimer}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Processed on: {result.device}</p>
            <button onClick={reset} className="bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-800 transition-colors">
              New Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
