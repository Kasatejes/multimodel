import React, { useState } from 'react';
import { api } from '../lib/axios';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import {
  Sparkles,
  Download,
  Loader2,
  Mic,
  Wand2,
  ImageIcon,
  RefreshCw,
  Copy,
  Check,
  Zap
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  'A futuristic banana floating in space surrounded by neon galaxies',
  'Cyberpunk city at night with glowing purple and indigo skyscrapers',
  'Multimodal AI neural network core rendering holographic data streams',
  'Cute robot banana reading a book in a cozy dimly lit library'
];

export const ImageGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>('gemini-3.1-flash-image');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const { isListening, isSupported, toggleListening } = useVoiceSearch({
    onResult: (text) => {
      setPrompt(text);
    }
  });

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setError('');
    setLoading(true);
    setGeneratedImage(null);

    try {
      const res = await api.post('/generate-image', { prompt });
      setGeneratedImage(res.data.image_base64);
      if (res.data.model) setModelName(res.data.model);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `nexus_gemini_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel border border-purple-500/20 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-glow-purple">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              Gemini Nano Banana AI Image Generator
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Generate ultra-high quality images using Model <span className="text-purple-300 font-bold">{modelName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-[10px] text-purple-200 font-bold shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Base64 Output Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel border border-purple-500/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Prompt Textarea
              </label>

              {isSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse shadow-glow-purple ring-2 ring-red-400'
                      : 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/60 border border-purple-500/30'
                  }`}
                >
                  <Mic className={`w-3 h-3 ${isListening ? 'animate-bounce' : ''}`} />
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              )}
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="relative">
                <textarea
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want Gemini AI to generate..."
                  className={`w-full p-4 rounded-2xl glass-input text-xs leading-relaxed resize-none transition-all ${
                    isListening ? 'border-purple-400 ring-2 ring-purple-500/40 bg-purple-950/30' : ''
                  }`}
                />

                {prompt && (
                  <button
                    type="button"
                    onClick={copyPrompt}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white rounded-lg bg-dark-900/80 border border-purple-500/20"
                    title="Copy prompt text"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!prompt.trim() || loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-glow-purple flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Synthesizing Gemini AI Image...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-purple-200" />
                    <span>Generate AI Image</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sample Prompts Presets */}
          <div className="glass-panel border border-purple-500/20 rounded-3xl p-5 space-y-3">
            <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Sample Presets
            </p>
            <div className="space-y-2">
              {SAMPLE_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p)}
                  className="w-full text-left p-2.5 rounded-2xl bg-dark-900/60 hover:bg-purple-900/40 border border-purple-500/20 text-xs text-purple-200 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{p}</span>
                  <Wand2 className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Image Preview & Download */}
        <div className="lg:col-span-7">
          <div className="glass-panel border border-purple-500/20 rounded-3xl p-6 min-h-[480px] flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <span className="text-xs font-extrabold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Generated Image Preview
              </span>

              {generatedImage && (
                <span className="text-[10px] text-green-400 bg-green-950/60 border border-green-500/30 px-2.5 py-1 rounded-full font-bold">
                  ✓ Base64 Ready
                </span>
              )}
            </div>

            {/* Display Screen */}
            <div className="flex-1 flex items-center justify-center p-2 rounded-2xl bg-dark-950/80 border border-purple-500/20 min-h-[360px] relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-400/30 flex items-center justify-center shadow-glow-purple">
                    <Loader2 className="w-8 h-8 text-purple-300 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Rendering Canvas</h4>
                    <p className="text-xs text-gray-400 mt-1">Executing Gemini 3.1 Flash Image model pipeline...</p>
                  </div>
                </div>
              ) : generatedImage ? (
                <div className="relative group w-full h-full flex items-center justify-center">
                  <img
                    src={generatedImage}
                    alt={prompt}
                    className="max-h-[420px] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-purple-500/30"
                  />
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-purple-900/20 border border-purple-500/20 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8 text-purple-400 opacity-40" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">No Image Generated Yet</h4>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                      Type a prompt on the left and click Generate AI Image to view Base64 output here.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Download Footer */}
            {generatedImage && (
              <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
                <span className="text-[10px] text-gray-400 font-mono truncate max-w-[240px]">
                  Model: {modelName}
                </span>

                <button
                  onClick={handleDownload}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-glow-purple flex items-center gap-2 transition-all transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image (PNG)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
