'use client';

import { useState, useRef } from 'react';
import { useTranslations } from '@/components/i18n-provider';
import { Upload, CheckCircle2, Loader2, FileText, Lock, ShieldCheck } from 'lucide-react';

const CATEGORY_KEYS = [
  'estructura', 'comptable', 'fiscal', 'bancs', 'actius',
  'clients', 'contractes', 'personal', 'contingencies', 'estrategica',
] as const;

const MAX_BYTES = 100 * 1024 * 1024; // 100MB single-part limit

interface UploadedFile {
  categoria: string;
  nomFitxer: string;
  status: 'uploading' | 'done' | 'error';
}

export function DocumentUploader({ valuationId }: { valuationId: string }) {
  const t = useTranslations('valoracio');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  async function uploadOne(categoria: string, file: File) {
    const entry: UploadedFile = { categoria, nomFitxer: file.name, status: 'uploading' };
    setFiles((prev) => [...prev, entry]);
    const update = (status: UploadedFile['status']) =>
      setFiles((prev) => prev.map((f) => (f === entry ? { ...f, status } : f)));

    try {
      if (file.size > MAX_BYTES) {
        update('error');
        return;
      }
      const presignRes = await fetch('/api/valuation/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valuationId, fileName: file.name, contentType: file.type }),
      });
      const presign = await presignRes.json();
      if (!presign?.success) { update('error'); return; }

      const putRes = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!putRes.ok) { update('error'); return; }

      const completeRes = await fetch('/api/valuation/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valuationId, categoria, nomFitxer: file.name,
          cloudStoragePath: presign.cloudStoragePath, contentType: file.type, mida: file.size,
        }),
      });
      const complete = await completeRes.json();
      update(complete?.success ? 'done' : 'error');
    } catch {
      update('error');
    }
  }

  function handleFiles(categoria: string, list: FileList | null) {
    if (!list) return;
    Array.from(list).forEach((file) => uploadOne(categoria, file));
  }

  const doneCount = files.filter((f) => f.status === 'done').length;

  return (
    <div className="space-y-8">
      <div className="bg-navy/5 border border-gold/20 rounded p-6 flex gap-4">
        <ShieldCheck className="text-gold flex-shrink-0 mt-0.5" size={22} strokeWidth={1.5} />
        <div>
          <p className="text-sm font-normal text-charcoal">{t('layer2.securityTitle')}</p>
          <p className="text-sm font-light text-charcoal/60 mt-1 leading-relaxed">{t('layer2.securityDesc')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {CATEGORY_KEYS.map((key, i) => {
          const catFiles = files.filter((f) => f.categoria === key);
          return (
            <div key={key} className="border border-stone/20 rounded p-5 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-normal text-charcoal">{`${i + 1}. ${t(`layer2.categories.${key}.title`)}`}</h4>
                  <p className="text-xs font-light text-charcoal/55 mt-1 leading-relaxed">{t(`layer2.categories.${key}.desc`)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => inputsRef.current[key]?.click()}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 border border-gold/40 text-charcoal text-xs font-medium tracking-wider uppercase rounded hover:bg-gold/10 transition-colors"
                >
                  <Upload size={14} /> {t('layer2.uploadButton')}
                </button>
                <input
                  ref={(el) => { inputsRef.current[key] = el; }}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => { handleFiles(key, e.target.files); e.target.value = ''; }}
                />
              </div>
              {catFiles.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {catFiles.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-light text-charcoal/70">
                      {f.status === 'uploading' && <Loader2 size={14} className="text-gold animate-spin" />}
                      {f.status === 'done' && <CheckCircle2 size={14} className="text-green-600" />}
                      {f.status === 'error' && <FileText size={14} className="text-red-500" />}
                      <span className="truncate">{f.nomFitxer}</span>
                      {f.status === 'error' && <span className="text-red-500">· {t('layer2.uploadError')}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs font-light text-charcoal/50 leading-relaxed flex gap-2">
        <Lock size={14} className="text-gold flex-shrink-0 mt-0.5" /> {t('layer2.dossierNote')}
      </p>

      {doneCount > 0 && (
        <div className="bg-navy rounded p-6 text-center">
          <CheckCircle2 className="text-gold mx-auto mb-3" size={28} />
          <p className="text-sm font-light text-offwhite leading-relaxed">{t('layer2.finishDesc', { count: String(doneCount) })}</p>
        </div>
      )}
    </div>
  );
}
