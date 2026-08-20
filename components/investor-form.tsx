'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from '@/components/i18n-provider';
import { SECTOR_KEYS } from '@/lib/valuation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { FormLegal } from '@/components/form-legal';
import { POLICY_VERSION } from '@/lib/consent';

const inputCls =
  'w-full px-4 py-3 bg-offwhite border border-stone/30 rounded text-sm font-light text-charcoal focus:outline-none focus:border-gold transition-colors';
const labelCls = 'block text-sm font-normal text-charcoal/70 mb-1.5';

export function InvestorForm() {
  const t = useTranslations('inversor');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nom: '', cognoms: '', email: '', telefon: '', entitat: '',
    tipusInversor: '', tiquetMin: '', tiquetMax: '', tipusOperacio: '',
    horitzo: '', zonaGeografica: '', criteris: '',
    consentPrivacitat: false, consentComercial: false,
    website: '', // honeypot (must stay empty)
  });
  const [sectors, setSectors] = useState<string[]>([]);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const el = e.target as HTMLInputElement;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    setForm((p) => ({ ...p, [el.name]: value }));
  };

  const toggleSector = (s: string) =>
    setSectors((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.consentPrivacitat) { setError(t('errors.consent')); return; }
    if (sectors.length === 0) { setError(t('errors.sectors')); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/investor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sectorsInteres: sectors, locale, politicaVersio: POLICY_VERSION }),
      });
      const data = await res.json();
      if (res.ok && data?.success) setSuccess(true);
      else setError(data?.message || t('errors.generic'));
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12 px-6 max-w-[600px] mx-auto">
        <ShieldCheck className="mx-auto mb-4 text-gold" size={40} strokeWidth={1.5} />
        <h3 className="text-xl font-light text-charcoal tracking-wide">{t('successTitle')}</h3>
        <p className="mt-3 text-sm font-light text-charcoal/70 leading-relaxed">{t('successDesc')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-[760px] mx-auto">
      {/* Honeypot: hidden from users, catches bots. Do not remove. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={handle} /></label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>{t('nom')} *</label>
          <input name="nom" value={form.nom} onChange={handle} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t('cognoms')} *</label>
          <input name="cognoms" value={form.cognoms} onChange={handle} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t('email')} *</label>
          <input name="email" type="email" value={form.email} onChange={handle} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t('telefon')}</label>
          <input name="telefon" type="tel" value={form.telefon} onChange={handle} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>{t('entitat')}</label>
        <input name="entitat" value={form.entitat} onChange={handle} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>{t('tipusInversor')} *</label>
        <select name="tipusInversor" value={form.tipusInversor} onChange={handle} required className={inputCls}>
          <option value="">{t('selectOption')}</option>
          <option value="particular">{t('tipusInversorOptions.particular')}</option>
          <option value="familyOffice">{t('tipusInversorOptions.familyOffice')}</option>
          <option value="empresa">{t('tipusInversorOptions.empresa')}</option>
          <option value="fons">{t('tipusInversorOptions.fons')}</option>
          <option value="altre">{t('tipusInversorOptions.altre')}</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>{t('sectorsLabel')} *</label>
        <div className="flex flex-wrap gap-2">
          {SECTOR_KEYS.map((s) => {
            const active = sectors.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSector(s)}
                className={`px-3 py-1.5 text-xs font-light rounded border transition-colors ${active ? 'bg-gold text-navy border-gold' : 'bg-offwhite text-charcoal/70 border-stone/30 hover:border-gold'}`}
              >
                {t(`sectors.${s}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>{t('tiquetMin')} <span className="text-charcoal/40">(EUR)</span></label>
          <input name="tiquetMin" value={form.tiquetMin} onChange={handle} inputMode="numeric" className={inputCls} placeholder="0" />
        </div>
        <div>
          <label className={labelCls}>{t('tiquetMax')} <span className="text-charcoal/40">(EUR)</span></label>
          <input name="tiquetMax" value={form.tiquetMax} onChange={handle} inputMode="numeric" className={inputCls} placeholder="0" />
        </div>
        <div>
          <label className={labelCls}>{t('tipusOperacio')}</label>
          <select name="tipusOperacio" value={form.tipusOperacio} onChange={handle} className={inputCls}>
            <option value="">—</option>
            <option value="majoritaria">{t('tipusOperacioOptions.majoritaria')}</option>
            <option value="minoritaria">{t('tipusOperacioOptions.minoritaria')}</option>
            <option value="total">{t('tipusOperacioOptions.total')}</option>
            <option value="flexible">{t('tipusOperacioOptions.flexible')}</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{t('horitzo')}</label>
          <input name="horitzo" value={form.horitzo} onChange={handle} className={inputCls} placeholder={t('horitzoPlaceholder')} />
        </div>
      </div>
      <div>
        <label className={labelCls}>{t('zonaGeografica')}</label>
        <input name="zonaGeografica" value={form.zonaGeografica} onChange={handle} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>{t('criteris')}</label>
        <textarea name="criteris" value={form.criteris} onChange={handle} rows={4} className={`${inputCls} resize-none`} />
      </div>

      <div className="pt-2">
        <FormLegal
          privacyChecked={form.consentPrivacitat}
          onPrivacyChange={(v) => setForm((p) => ({ ...p, consentPrivacitat: v }))}
          commercialChecked={form.consentComercial}
          onCommercialChange={(v) => setForm((p) => ({ ...p, consentComercial: v }))}
        />
      </div>

      {error && <p className="text-sm text-red-600 font-light">{error}</p>}

      <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-navy text-sm font-medium tracking-wider uppercase rounded hover:bg-gold/90 transition-colors disabled:opacity-50">
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
