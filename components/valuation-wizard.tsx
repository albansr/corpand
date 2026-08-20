'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from '@/components/i18n-provider';
import { SECTOR_KEYS, formatEur } from '@/lib/valuation';
import { DocumentUploader } from '@/components/document-uploader';
import { getLocalePath } from '@/lib/locale-link';
import { FormLegalNotice } from '@/components/form-legal';
import { POLICY_VERSION } from '@/lib/consent';
import Link from 'next/link';
import {
  Loader2, Lock, ShieldCheck, TrendingUp, FileText, ArrowRight, ArrowLeft,
  Paperclip, X, CheckCircle2, BarChart3,
} from 'lucide-react';

const inputCls =
  'w-full px-4 py-3 bg-offwhite border border-stone/30 rounded text-sm font-light text-charcoal focus:outline-none focus:border-gold transition-colors';
const labelCls = 'block text-sm font-normal text-charcoal/70 mb-1.5';
const sectionCls = 'text-xs tracking-[0.18em] uppercase text-gold/90 pt-2';

interface KpiState {
  sector: string;
  facturacio: string;
  ebitda: string;
  beneficiNet: string;
  deuteFinancer: string;
  tresoreria: string;
  patrimoniNet: string;
  empleats: string;
  anysActivitat: string;
  creixement: string;
  recurrencia: string;
}

interface LeadState {
  nom: string;
  cognoms: string;
  email: string;
  telefon: string;
  empresa: string;
  consentPrivacitat: boolean;
  consentContacte: boolean;
}

interface Result {
  id: string;
  valorMin: number;
  valorMitja: number;
  valorMax: number;
  metodePrincipal: string;
}

const REQUIRED_KPI: (keyof KpiState)[] = [
  'sector', 'facturacio', 'ebitda', 'deuteFinancer', 'tresoreria',
  'anysActivitat', 'creixement', 'recurrencia',
];

export function ValuationWizard() {
  const t = useTranslations('valoracio');
  const locale = useLocale();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [report, setReport] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [voluntaryFiles, setVoluntaryFiles] = useState<File[]>([]);
  const voluntaryInputRef = useRef<HTMLInputElement | null>(null);

  const [kpi, setKpi] = useState<KpiState>({
    sector: '', facturacio: '', ebitda: '', beneficiNet: '', deuteFinancer: '',
    tresoreria: '', patrimoniNet: '', empleats: '', anysActivitat: '', creixement: '', recurrencia: '',
  });
  const [lead, setLead] = useState<LeadState>({
    nom: '', cognoms: '', email: '', telefon: '', empresa: '',
    consentPrivacitat: false, consentContacte: false,
  });

  const handleKpi = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setKpi((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleLead = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    setLead((p) => ({ ...p, [el.name]: value }));
  };

  function addVoluntaryFiles(list: FileList | null) {
    if (!list) return;
    setVoluntaryFiles((prev) => [...prev, ...Array.from(list)]);
  }
  function removeVoluntaryFile(idx: number) {
    setVoluntaryFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function goStep2(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const missing = REQUIRED_KPI.some((k) => !String(kpi[k] ?? '').trim());
    if (missing) { setError(t('errors.requiredFull')); return; }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function fetchReport(id: string) {
    setReportLoading(true);
    try {
      const res = await fetch('/api/valuation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data?.report) setReport(data.report);
    } catch { /* silent */ } finally {
      setReportLoading(false);
    }
  }

  async function uploadVoluntaryDocs(id: string) {
    for (const file of voluntaryFiles) {
      try {
        if (file.size > 100 * 1024 * 1024) continue;
        const presignRes = await fetch('/api/valuation/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ valuationId: id, fileName: file.name, contentType: file.type }),
        });
        const presign = await presignRes.json();
        if (!presign?.success) continue;
        const putRes = await fetch(presign.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!putRes.ok) continue;
        await fetch('/api/valuation/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            valuationId: id, categoria: 'voluntaria', nomFitxer: file.name,
            cloudStoragePath: presign.cloudStoragePath, contentType: file.type, mida: file.size,
          }),
        });
      } catch { /* silent, non-blocking */ }
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!lead.consentPrivacitat) { setError(t('errors.consent')); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...kpi, ...lead, locale, politicaVersio: POLICY_VERSION }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setResult(data);
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchReport(data.id);
        if (voluntaryFiles.length) { void uploadVoluntaryDocs(data.id); }
      } else {
        setError(data?.message || t('errors.generic'));
      }
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  // ---- Progress indicator ----
  const steps = [t('wizard.step1Label'), t('wizard.step2Label'), t('wizard.step3Label')];
  const Progress = () => (
    <div className="flex items-center justify-center gap-3 mb-10">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = step >= n;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${active ? 'bg-gold text-navy' : 'bg-stone/25 text-charcoal/50'}`}>{n}</span>
              <span className={`hidden sm:inline text-xs tracking-wider uppercase ${active ? 'text-charcoal' : 'text-charcoal/40'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-6 sm:w-10 h-px ${step > n ? 'bg-gold' : 'bg-stone/30'}`} />}
          </div>
        );
      })}
    </div>
  );

  // ---- STEP 3: RESULT ----
  if (step === 3 && result) {
    const nextSteps = (t.raw('result.nextSteps') as Array<{ title: string; desc: string }>) ?? [];
    return (
      <div className="max-w-[760px] mx-auto">
        <Progress />

        {/* Confirmation banner */}
        <div className="flex items-start gap-4 bg-navy rounded-lg p-6 md:p-7">
          <CheckCircle2 size={26} className="text-gold flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <h2 className="text-lg md:text-xl font-normal text-offwhite tracking-wide">{t('result.confirmTitle')}</h2>
            <p className="mt-2 text-sm font-light text-stone leading-relaxed">{t('result.confirmDesc')}</p>
            {voluntaryFiles.length > 0 && (
              <p className="mt-3 flex items-center gap-2 text-xs font-light text-gold/90">
                <Loader2 size={13} className="animate-spin" /> {t('result.uploadingDocs')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-gold">{t('result.badge')}</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-light text-charcoal tracking-wide">{t('result.title')}</h2>
        </div>

        <div className="mt-8 bg-navy rounded-lg p-8 md:p-10 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-stone">{t('result.rangeLabel')}</p>
          <div className="mt-4 flex items-end justify-center gap-3 flex-wrap">
            <span className="text-2xl md:text-3xl font-light text-offwhite/80">{formatEur(result.valorMin, locale)}</span>
            <span className="text-gold text-xl">–</span>
            <span className="text-3xl md:text-5xl font-light text-gold">{formatEur(result.valorMax, locale)}</span>
          </div>
          <p className="mt-4 text-sm font-light text-stone">{t('result.centralLabel')}: <span className="text-offwhite">{formatEur(result.valorMitja, locale)}</span></p>
        </div>

        {/* Methodology note */}
        <div className="mt-6 flex items-start gap-3 bg-white border border-stone/20 rounded p-5">
          <BarChart3 size={18} className="text-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-normal text-charcoal">{t('result.methodTitle')}</p>
            <p className="mt-1 text-xs font-light text-charcoal/65 leading-relaxed">{t('result.methodDesc')}</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 bg-gold/5 border border-gold/20 rounded p-5">
          <ShieldCheck size={18} className="text-gold flex-shrink-0 mt-0.5" />
          <p className="text-xs font-light text-charcoal/70 leading-relaxed">{t('result.disclaimer')}</p>
        </div>

        {/* Next steps */}
        <div className="mt-12">
          <h3 className="text-lg font-light text-charcoal tracking-wide text-center">{t('result.nextStepsTitle')}</h3>
          <div className="w-16 h-px bg-gold mx-auto mt-4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextSteps.map((s, i) => (
              <div key={i} className="border border-stone/20 rounded p-5 bg-white">
                <span className="w-7 h-7 rounded-full bg-gold/10 text-gold flex items-center justify-center text-xs font-medium">{i + 1}</span>
                <h4 className="mt-3 text-sm font-normal text-charcoal">{s.title}</h4>
                <p className="mt-1.5 text-xs font-light text-charcoal/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Confidentiality reminder */}
        <div className="mt-8 flex items-start gap-3 bg-navy/5 border border-gold/20 rounded p-5">
          <Lock size={18} className="text-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-normal text-charcoal">{t('result.confidentialityTitle')}</p>
            <p className="mt-1 text-xs font-light text-charcoal/65 leading-relaxed">{t('result.confidentialityDesc')}</p>
          </div>
        </div>

        {/* AI reading */}
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-gold" />
            <h3 className="text-lg font-light text-charcoal tracking-wide">{t('result.reportTitle')}</h3>
          </div>
          <div className="w-16 h-px bg-gold mt-4 mb-6" />
          {reportLoading && (
            <div className="flex items-center gap-3 text-sm font-light text-charcoal/60">
              <Loader2 size={16} className="animate-spin text-gold" /> {t('result.reportLoading')}
            </div>
          )}
          {!reportLoading && report && (
            <div className="text-sm font-light text-charcoal/80 leading-relaxed whitespace-pre-line">{report}</div>
          )}
          {!reportLoading && !report && (
            <p className="text-sm font-light text-charcoal/60">{t('result.reportUnavailable')}</p>
          )}
        </div>

        {/* Layer 2: refined valuation dossier */}
        <div className="mt-14 border-t border-stone/20 pt-10">
          <div className="text-center">
            <FileText size={28} className="text-gold mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="text-xl font-light text-charcoal tracking-wide">{t('layer2.title')}</h3>
            <p className="mt-3 text-sm font-light text-charcoal/65 leading-relaxed max-w-[560px] mx-auto">{t('layer2.desc')}</p>
          </div>
          {!showDossier ? (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowDossier(true)}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-navy text-sm font-medium tracking-wider uppercase rounded hover:bg-gold/90 transition-colors"
              >
                {t('layer2.cta')} <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="mt-10">
              <DocumentUploader valuationId={result.id} />
            </div>
          )}
        </div>

        <div className="mt-14 text-center">
          <Link href={getLocalePath(locale, '/contacte')} className="text-sm text-gold hover:text-gold/80 tracking-wider uppercase transition-colors">
            {t('result.contactCta')}
          </Link>
        </div>
      </div>
    );
  }

  // ---- STEP 1 & 2 FORM ----
  return (
    <div className="max-w-[760px] mx-auto">
      <Progress />

      {step === 1 && (
        <form onSubmit={goStep2} className="space-y-5">
          {/* Precision note */}
          <div className="flex items-start gap-3 bg-gold/5 border border-gold/20 rounded p-4">
            <TrendingUp size={17} className="text-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs font-light text-charcoal/70 leading-relaxed">{t('wizard.precisionNote')}</p>
          </div>

          {/* Section: basic */}
          <p className={sectionCls}>{t('wizard.sectionBasic')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelCls}>{t('wizard.sector')} *</label>
              <select name="sector" value={kpi.sector} onChange={handleKpi} required className={inputCls}>
                <option value="">{t('wizard.sectorPlaceholder')}</option>
                {SECTOR_KEYS.map((s) => (
                  <option key={s} value={s}>{t(`sectors.${s}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t('wizard.facturacio')} * <span className="text-charcoal/40 font-light">(EUR)</span></label>
              <input name="facturacio" value={kpi.facturacio} onChange={handleKpi} inputMode="numeric" required className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>{t('wizard.anysActivitat')} *</label>
              <input name="anysActivitat" value={kpi.anysActivitat} onChange={handleKpi} inputMode="numeric" required className={inputCls} placeholder="0" />
            </div>
          </div>

          {/* Section: financial */}
          <p className={sectionCls}>{t('wizard.sectionFinancial')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>{t('wizard.ebitda')} *</label>
              <input name="ebitda" value={kpi.ebitda} onChange={handleKpi} inputMode="numeric" required className={inputCls} placeholder="EUR" />
            </div>
            <div>
              <label className={labelCls}>{t('wizard.deuteFinancer')} *</label>
              <input name="deuteFinancer" value={kpi.deuteFinancer} onChange={handleKpi} inputMode="numeric" required className={inputCls} placeholder="EUR" />
            </div>
            <div>
              <label className={labelCls}>{t('wizard.tresoreria')} *</label>
              <input name="tresoreria" value={kpi.tresoreria} onChange={handleKpi} inputMode="numeric" required className={inputCls} placeholder="EUR" />
            </div>
            <div>
              <label className={labelCls}>{t('wizard.beneficiNet')}</label>
              <input name="beneficiNet" value={kpi.beneficiNet} onChange={handleKpi} inputMode="numeric" className={inputCls} placeholder="EUR" />
            </div>
            <div>
              <label className={labelCls}>{t('wizard.patrimoniNet')}</label>
              <input name="patrimoniNet" value={kpi.patrimoniNet} onChange={handleKpi} inputMode="numeric" className={inputCls} placeholder="EUR" />
            </div>
            <div>
              <label className={labelCls}>{t('wizard.empleats')}</label>
              <input name="empleats" value={kpi.empleats} onChange={handleKpi} inputMode="numeric" className={inputCls} placeholder="0" />
            </div>
          </div>

          {/* Section: qualitative */}
          <p className={sectionCls}>{t('wizard.sectionQualitative')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>{t('wizard.creixement')} *</label>
              <select name="creixement" value={kpi.creixement} onChange={handleKpi} required className={inputCls}>
                <option value="">—</option>
                <option value="negatiu">{t('wizard.creixementOptions.negatiu')}</option>
                <option value="estable">{t('wizard.creixementOptions.estable')}</option>
                <option value="moderat">{t('wizard.creixementOptions.moderat')}</option>
                <option value="alt">{t('wizard.creixementOptions.alt')}</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{t('wizard.recurrencia')} *</label>
              <select name="recurrencia" value={kpi.recurrencia} onChange={handleKpi} required className={inputCls}>
                <option value="">—</option>
                <option value="baixa">{t('wizard.recurrenciaOptions.baixa')}</option>
                <option value="mitjana">{t('wizard.recurrenciaOptions.mitjana')}</option>
                <option value="alta">{t('wizard.recurrenciaOptions.alta')}</option>
              </select>
            </div>
          </div>

          {/* Section: voluntary documents */}
          <p className={sectionCls}>{t('wizard.docsTitle')}</p>
          <div className="border border-dashed border-stone/40 rounded p-5 bg-offwhite/40">
            <p className="text-xs font-light text-charcoal/65 leading-relaxed">{t('wizard.docsDesc')}</p>
            <button
              type="button"
              onClick={() => voluntaryInputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 border border-gold/40 text-charcoal text-xs font-medium tracking-wider uppercase rounded hover:bg-gold/10 transition-colors"
            >
              <Paperclip size={14} /> {t('wizard.docsAttach')}
            </button>
            <input
              ref={voluntaryInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => { addVoluntaryFiles(e.target.files); e.target.value = ''; }}
            />
            {voluntaryFiles.length > 0 && (
              <ul className="mt-4 space-y-2">
                {voluntaryFiles.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-light text-charcoal/70">
                    <FileText size={14} className="text-gold flex-shrink-0" />
                    <span className="truncate flex-1">{f.name}</span>
                    <button type="button" onClick={() => removeVoluntaryFile(idx)} className="text-charcoal/40 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="flex items-start gap-2 text-xs font-light text-charcoal/45 leading-relaxed pt-1">
            <BarChart3 size={13} className="text-gold/70 flex-shrink-0 mt-0.5" /> {t('wizard.methodNote')}
          </p>
          <p className="text-xs font-light text-charcoal/40">{t('wizard.requiredHint')}</p>

          {error && <p className="text-sm text-red-600 font-light">{error}</p>}

          <div className="pt-2">
            <button type="submit" className="inline-flex items-center gap-2 px-8 py-3 bg-navy text-offwhite text-sm font-medium tracking-wider uppercase rounded hover:bg-navy/90 transition-colors">
              {t('wizard.next')} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submit} className="space-y-5">
          <div className="flex items-start gap-3 bg-navy/5 border border-gold/20 rounded p-5 mb-2">
            <Lock size={18} className="text-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs font-light text-charcoal/70 leading-relaxed">{t('wizard.leadIntro')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>{t('wizard.nom')} *</label>
              <input name="nom" value={lead.nom} onChange={handleLead} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('wizard.cognoms')} *</label>
              <input name="cognoms" value={lead.cognoms} onChange={handleLead} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('wizard.email')} *</label>
              <input name="email" type="email" value={lead.email} onChange={handleLead} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('wizard.telefon')}</label>
              <input name="telefon" type="tel" value={lead.telefon} onChange={handleLead} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('wizard.empresa')}</label>
            <input name="empresa" value={lead.empresa} onChange={handleLead} className={inputCls} />
          </div>

          <FormLegalNotice />

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input type="checkbox" name="consentPrivacitat" checked={lead.consentPrivacitat} onChange={handleLead} required className="mt-1 accent-gold" />
            <span className="text-sm font-light text-charcoal/70 leading-relaxed">
              {t('wizard.consentPrivacitat')}{' '}
              <Link href={getLocalePath(locale, '/privacitat')} target="_blank" className="text-gold hover:underline">{t('wizard.privacyLink')}</Link>.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="consentContacte" checked={lead.consentContacte} onChange={handleLead} className="mt-1 accent-gold" />
            <span className="text-sm font-light text-charcoal/70 leading-relaxed">{t('wizard.consentContacte')}</span>
          </label>

          {error && <p className="text-sm text-red-600 font-light">{error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <button type="button" onClick={() => { setStep(1); setError(''); }} className="inline-flex items-center gap-2 px-6 py-3 border border-stone/40 text-charcoal text-sm font-medium tracking-wider uppercase rounded hover:bg-stone/10 transition-colors">
              <ArrowLeft size={16} /> {t('wizard.back')}
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-navy text-sm font-medium tracking-wider uppercase rounded hover:bg-gold/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? t('wizard.calculating') : t('wizard.calculate')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
