import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Lock,
  Eye,
  Sparkles,
  AlertTriangle,
  Key,
  CheckCircle2,
  FileCheck,
  Server
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
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
            Configure prompt injection guardrails, content moderation, PII scrubbing, and AI model policies.
          </p>
        </div>
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
