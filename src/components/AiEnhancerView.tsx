import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { Sparkles, Copy, Check, RefreshCw, Globe, ArrowRight, Zap, Lightbulb } from 'lucide-react';

interface AiEnhancerViewProps {
  currentLang: Language;
}

export const AiEnhancerView: React.FC<AiEnhancerViewProps> = ({ currentLang }) => {
  const t = getTranslation(currentLang);

  const [inputRaw, setInputRaw] = useState('');
  const [outputResult, setOutputResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    'I worked on site inspecting concrete pouring, rebar placement, and checking if contractor followed drawings for a 12 story building.',
    'I measured quantities for road excavation, culverts, and asphalt laying for ERA highway project.',
    'እኔ በቦሌ መንገድ ድልድይ ፕሮጀክት ላይ የሲቪል መሃንዲስ ሆኜ የሲሚንቶ ጥራት እና የአስፋልት ሙከራዎችን አከናውኛለሁ።'
  ];

  const handleRunAi = async (action: 'enhance' | 'translate', targetLang?: string) => {
    if (!inputRaw.trim()) return;
    setLoading(true);
    setOutputResult('');

    try {
      const res = await fetch('/api/gemini/enhance-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: inputRaw,
          action,
          targetLang: targetLang || currentLang
        })
      });

      const data = await res.json();
      if (data.success) {
        setOutputResult(data.result);
      } else {
        setOutputResult('Error: ' + (data.error || 'Failed to process AI request.'));
      }
    } catch (err: any) {
      setOutputResult('Error connecting to Gemini API endpoint.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (outputResult) {
      navigator.clipboard.writeText(outputResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-[#141414] border border-white/5 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-3">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] block mb-1">DAR AI SUITE</span>
            <h2 className="text-lg sm:text-2xl font-light text-white">{t.aiTitle}</h2>
            <p className="text-xs text-white/50 mt-1">{t.aiDesc}</p>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Input Textarea & Controls */}
        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} className="text-[#C5A059]" />
              {t.inputRawText}
            </label>

            <button
              onClick={() => setInputRaw('')}
              className="text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white"
            >
              Clear
            </button>
          </div>

          <textarea
            rows={8}
            value={inputRaw}
            onChange={e => setInputRaw(e.target.value)}
            placeholder="Paste raw employee experience, task notes, or old CV text in Amharic, English, or Arabic..."
            className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/30 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] leading-relaxed font-sans"
          />

          {/* Sample preset buttons */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1">
              <Lightbulb size={12} className="text-[#C5A059]" /> Test with sample input:
            </span>
            <div className="flex flex-col gap-1.5">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputRaw(sample)}
                  className="text-left text-[11px] p-2.5 rounded-lg bg-[#0F0F0F] hover:bg-white/5 text-white/70 border border-white/5 line-clamp-1 transition-colors"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-3 border-t border-white/5">
            <button
              onClick={() => handleRunAi('enhance')}
              disabled={loading || !inputRaw.trim()}
              className="flex-1 min-w-[180px] py-2.5 px-4 rounded-lg bg-[#C5A059] hover:bg-[#d8b26a] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/10 disabled:opacity-50 transition-all"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {t.enhanceAction}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleRunAi('translate', 'am')}
                disabled={loading || !inputRaw.trim()}
                className="py-2.5 px-3 rounded-lg bg-[#1A1A1A] hover:bg-white/10 text-white text-xs font-bold uppercase border border-white/10 disabled:opacity-50"
                title="Translate to Amharic"
              >
                አማ
              </button>
              <button
                onClick={() => handleRunAi('translate', 'en')}
                disabled={loading || !inputRaw.trim()}
                className="py-2.5 px-3 rounded-lg bg-[#1A1A1A] hover:bg-white/10 text-white text-xs font-bold uppercase border border-white/10 disabled:opacity-50"
                title="Translate to English"
              >
                EN
              </button>
              <button
                onClick={() => handleRunAi('translate', 'ar')}
                disabled={loading || !inputRaw.trim()}
                className="py-2.5 px-3 rounded-lg bg-[#1A1A1A] hover:bg-white/10 text-white text-xs font-bold uppercase border border-white/10 disabled:opacity-50"
                title="Translate to Arabic"
              >
                ع
              </button>
            </div>
          </div>

        </div>

        {/* Right: Output Window */}
        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-4 shadow-2xl flex flex-col justify-between">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-2">
                <Globe size={14} />
                {t.aiOutput}
              </label>

              {outputResult && (
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            <div className="w-full h-[280px] bg-[#0F0F0F] border border-white/10 rounded-xl p-4 text-xs text-white overflow-y-auto leading-relaxed font-sans whitespace-pre-wrap">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40 gap-2">
                  <RefreshCw size={24} className="animate-spin text-[#C5A059]" />
                  <span className="text-xs">Generating consultancy-standard response via Gemini...</span>
                </div>
              ) : outputResult ? (
                outputResult
              ) : (
                <span className="text-white/30 italic">
                  AI enhanced CV output will appear here after clicking "Enhance" or "Translate"...
                </span>
              )}
            </div>
          </div>

          <div className="text-[10px] font-mono text-white/40 pt-3 border-t border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            Powered by Gemini Flash 2.5 on server backend for Dar Business Development.
          </div>

        </div>

      </div>

    </div>
  );
};
