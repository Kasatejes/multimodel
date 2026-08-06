import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  Key,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [savedKeyActive, setSavedKeyActive] = useState<boolean>(false);

  useEffect(() => {
    const existing = localStorage.getItem('nexus_custom_gemini_api_key');
    if (existing) {
      setGeminiKey(existing);
      setSavedKeyActive(true);
    }
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = geminiKey.trim();
    if (!cleanKey) return;

    localStorage.setItem('nexus_custom_gemini_api_key', cleanKey);
    setSavedKeyActive(true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearKey = () => {
    localStorage.removeItem('nexus_custom_gemini_api_key');
    setGeminiKey('');
    setSavedKeyActive(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel border border-purple-500/20 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-glow-purple">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            AI Security & Responsible AI Settings
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure prompt injection guardrails, content moderation, custom API keys, and model policies.
          </p>
        </div>
      </div>

      {/* Bring Your Own Gemini API Key Card */}
      <div className="glass-panel border border-purple-500/30 rounded-3xl p-6 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center">
              <Key className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Google Gemini API Key</h2>
              <p className="text-xs text-gray-400">Enter your custom Google Gemini API Key to use for document analysis and AI chat.</p>
            </div>
          </div>
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${savedKeyActive ? 'bg-green-950/80 text-green-300 border-green-500/30' : 'bg-purple-950/80 text-purple-300 border-purple-500/30'}`}>
            {savedKeyActive ? 'CUSTOM KEY ACTIVE' : 'USING SYSTEM DEFAULT'}
          </span>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-3 pt-2">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Paste your Gemini API Key (e.g. AIzaSy...)"
              className="w-full bg-dark-950/90 border border-purple-500/30 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 pr-24 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {geminiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                  title="Remove saved key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              Get a free API key from Google AI Studio
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Saved!
                </span>
              )}
              <button
                type="submit"
                disabled={!geminiKey.trim()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-glow-purple disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save API Key
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel border border-purple-500/20 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              Prompt Injection Defense
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-950/80 text-green-300 border border-green-500/30">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Automatically intercepts and blocks malicious instructions, jailbreak attempts, and system prompt override attempts.
          </p>
        </div>

        <div className="glass-panel border border-purple-500/20 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              PII & Secret Sanitization
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-950/80 text-green-300 border border-green-500/30">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Scrubs Social Security numbers, credit card numbers, Slack tokens, and API secret keys before prompts reach LLMs.
          </p>
        </div>
      </div>

      {/* Responsible AI Principles Notice */}
      <div className="glass-panel border border-purple-500/20 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Nexus Responsible AI Principles
        </h3>

        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-dark-900/60 border border-purple-500/20 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-0.5">Transparency & Explainability</p>
              <p className="text-gray-400">All AI-synthesized outputs carry clear AI Generation badges and model identifiers.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-dark-900/60 border border-purple-500/20 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-0.5">Content Moderation & Bias Auditing</p>
              <p className="text-gray-400">Multi-stage content safety filters evaluate prompts for hate speech, harassment, and bias.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-dark-900/60 border border-purple-500/20 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-0.5">Hallucination Warning</p>
              <p className="text-gray-400">Generative language models may occasionally output factual inaccuracies. Always verify critical data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
