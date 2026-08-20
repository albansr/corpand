'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from '@/components/i18n-provider';
import { Shield } from 'lucide-react';
import { FormLegal } from '@/components/form-legal';
import { POLICY_VERSION } from '@/lib/consent';

interface ContactFormProps {
  defaultTipus?: string;
}

export function ContactForm({ defaultTipus }: ContactFormProps) {
  const t = useTranslations('form');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nom: '',
    cognoms: '',
    email: '',
    telefon: '',
    tipusOperacio: defaultTipus ?? '',
    missatge: '',
    consentPrivacitat: false,
    consentComercial: false,
    website: '', // honeypot (must stay empty)
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.consentPrivacitat) { setError(t('consentRequired')); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale, politicaVersio: POLICY_VERSION }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        setSuccess(true);
        setForm({ nom: '', cognoms: '', email: '', telefon: '', tipusOperacio: defaultTipus ?? '', missatge: '', consentPrivacitat: false, consentComercial: false, website: '' });
      } else {
        setError(data?.message ?? t('error'));
      }
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 px-6">
        <Shield className="mx-auto mb-4 text-gold" size={40} />
        <p className="text-lg font-light text-charcoal">{t('success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot: hidden from users, catches bots. Do not remove. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={handleChange} /></label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-normal text-charcoal/70 mb-1.5">{t('nom')} *</label>
          <input name="nom" value={form.nom} onChange={handleChange} required className="w-full px-4 py-3 bg-offwhite border border-stone/30 rounded text-sm font-light text-charcoal focus:outline-none focus:border-gold transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-normal text-charcoal/70 mb-1.5">{t('cognoms')} *</label>
          <input name="cognoms" value={form.cognoms} onChange={handleChange} required className="w-full px-4 py-3 bg-offwhite border border-stone/30 rounded text-sm font-light text-charcoal focus:outline-none focus:border-gold transition-colors" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-normal text-charcoal/70 mb-1.5">{t('email')} *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 bg-offwhite border border-stone/30 rounded text-sm font-light text-charcoal focus:outline-none focus:border-gold transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-normal text-charcoal/70 mb-1.5">{t('telefon')}</label>
          <input name="telefon" type="tel" value={form.telefon} onChange={handleChange} className="w-full px-4 py-3 bg-offwhite border border-stone/30 rounded text-sm font-light text-charcoal focus:outline-none focus:border-gold transition-colors" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-normal text-charcoal/70 mb-1.5">{t('tipusOperacio')} *</label>
        <select name="tipusOperacio" value={form.tipusOperacio} onChange={handleChange} required className="w-full px-4 py-3 bg-offwhite border border-stone/30 rounded text-sm font-light text-charcoal focus:outline-none focus:border-gold transition-colors">
          <option value="">{t('selectOption')}</option>
          <option value="vendre">{t('tipusOptions.vendre')}</option>
          <option value="comprar">{t('tipusOptions.comprar')}</option>
          <option value="implantacio">{t('tipusOptions.implantacio')}</option>
          <option value="altra">{t('tipusOptions.altra')}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-normal text-charcoal/70 mb-1.5">{t('missatge')} *</label>
        <textarea name="missatge" value={form.missatge} onChange={handleChange} required rows={5} className="w-full px-4 py-3 bg-offwhite border border-stone/30 rounded text-sm font-light text-charcoal focus:outline-none focus:border-gold transition-colors resize-none" />
      </div>
      <FormLegal
        privacyChecked={form.consentPrivacitat}
        onPrivacyChange={(v) => setForm((p) => ({ ...p, consentPrivacitat: v }))}
        commercialChecked={form.consentComercial}
        onCommercialChange={(v) => setForm((p) => ({ ...p, consentComercial: v }))}
      />
      {error && <p className="text-sm text-red-600 font-light">{error}</p>}
      <button type="submit" disabled={loading} className="inline-flex items-center px-8 py-3 bg-gold text-navy text-sm font-medium tracking-wider uppercase rounded hover:bg-gold/90 transition-colors duration-200 disabled:opacity-50">
        {loading ? t('enviant') : t('enviar')}
      </button>
    </form>
  );
}
