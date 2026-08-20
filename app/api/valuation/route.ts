import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { computeValuation, formatEur, type ValuationInput } from '@/lib/valuation';
import {
  isValidEmail,
  escapeHtml,
  isHoneypotTripped,
  checkRateLimit,
  getClientIp,
} from '@/lib/form-security';

export const dynamic = 'force-dynamic';

function num(v: any): number | null {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? null : n;
}

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`valuation:${getClientIp(request)}`)) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }

    const data = await request.json();

    if (isHoneypotTripped(data)) {
      return NextResponse.json({ success: true });
    }

    const {
      nom, cognoms, email, telefon, empresa,
      sector, anysActivitat, facturacio, ebitda, beneficiNet,
      deuteFinancer, tresoreria, patrimoniNet, empleats, creixement, recurrencia,
      consentPrivacitat, consentContacte, politicaVersio, locale,
    } = data ?? {};

    if (!nom || !cognoms || !email || !sector || facturacio == null || facturacio === '' || ebitda == null || ebitda === '') {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 });
    }
    if (!consentPrivacitat) {
      return NextResponse.json({ success: false, message: 'Consent required' }, { status: 400 });
    }

    const input: ValuationInput = {
      sector: String(sector),
      facturacio: num(facturacio) ?? 0,
      ebitda: num(ebitda),
      beneficiNet: num(beneficiNet),
      deuteFinancer: num(deuteFinancer),
      tresoreria: num(tresoreria),
      patrimoniNet: num(patrimoniNet),
      empleats: num(empleats),
      anysActivitat: num(anysActivitat),
      creixement: creixement ? String(creixement) : null,
      recurrencia: recurrencia ? String(recurrencia) : null,
    };

    const result = computeValuation(input);

    const record = await prisma.valuationRequest.create({
      data: {
        nom: String(nom),
        cognoms: String(cognoms),
        email: String(email),
        telefon: telefon ? String(telefon) : null,
        empresa: empresa ? String(empresa) : null,
        sector: input.sector,
        anysActivitat: input.anysActivitat ?? null,
        facturacio: input.facturacio,
        ebitda: input.ebitda ?? null,
        beneficiNet: input.beneficiNet ?? null,
        deuteFinancer: input.deuteFinancer ?? null,
        tresoreria: input.tresoreria ?? null,
        patrimoniNet: input.patrimoniNet ?? null,
        empleats: input.empleats ?? null,
        creixement: input.creixement ?? null,
        recurrencia: input.recurrencia ?? null,
        valorMin: result.valorMin,
        valorMitja: result.valorMitja,
        valorMax: result.valorMax,
        metodePrincipal: result.metodePrincipal,
        ebitdaMultipleMin: result.ebitdaMultipleMin,
        ebitdaMultipleMax: result.ebitdaMultipleMax,
        locale: String(locale ?? 'ca'),
        consentPrivacitat: Boolean(consentPrivacitat),
        consentContacte: Boolean(consentContacte),
        politicaVersio: typeof politicaVersio === 'string' ? politicaVersio.slice(0, 40) : null,
        status: 'nou',
      },
    });

    // Admin notification (must not fail the request).
    try {
      const appUrl = process.env.NEXTAUTH_URL ?? '';
      const range = `${formatEur(result.valorMin, 'ca')} – ${formatEur(result.valorMax, 'ca')}`;
      const htmlBody = `
        <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F6F4EF; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 22px; letter-spacing: 0.3em; font-weight: 300; color: #0B1D2D; margin: 0;">CORPAND</h1>
            <div style="width: 40px; height: 1px; background: #C9A66B; margin: 12px auto;"></div>
            <p style="font-size: 10px; letter-spacing: 0.2em; color: #B7B4AC; margin: 0;">SOL·LICITUD DE VALORACIÓ</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 4px; border-left: 3px solid #C9A66B;">
            <h2 style="font-size: 16px; font-weight: 400; color: #222427; margin: 0 0 16px 0;">Nova sol·licitud de valoració</h2>
            <table style="width: 100%; font-size: 14px; color: #222427;">
              <tr><td style="padding: 6px 0; color: #B7B4AC; width: 140px;">Nom:</td><td style="padding: 6px 0;">${escapeHtml(nom)} ${escapeHtml(cognoms)}</td></tr>
              <tr><td style="padding: 6px 0; color: #B7B4AC;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #C9A66B;">${escapeHtml(email)}</a></td></tr>
              ${telefon ? `<tr><td style="padding: 6px 0; color: #B7B4AC;">Telèfon:</td><td style="padding: 6px 0;">${escapeHtml(telefon)}</td></tr>` : ''}
              ${empresa ? `<tr><td style="padding: 6px 0; color: #B7B4AC;">Empresa:</td><td style="padding: 6px 0;">${escapeHtml(empresa)}</td></tr>` : ''}
              <tr><td style="padding: 6px 0; color: #B7B4AC;">Sector:</td><td style="padding: 6px 0;">${escapeHtml(input.sector)}</td></tr>
              <tr><td style="padding: 6px 0; color: #B7B4AC;">Facturació:</td><td style="padding: 6px 0;">${formatEur(input.facturacio, 'ca')}</td></tr>
              ${input.ebitda != null ? `<tr><td style="padding: 6px 0; color: #B7B4AC;">EBITDA:</td><td style="padding: 6px 0;">${formatEur(input.ebitda, 'ca')}</td></tr>` : ''}
            </table>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #F6F4EF;">
              <p style="font-size: 12px; color: #B7B4AC; margin: 0 0 6px 0;">Rang orientatiu calculat:</p>
              <p style="font-size: 18px; color: #0B1D2D; margin: 0; font-weight: 500;">${range}</p>
              <p style="font-size: 12px; color: #B7B4AC; margin: 8px 0 0 0;">Mètode principal: ${result.metodePrincipal} · ID: ${record.id}</p>
            </div>
          </div>
          <p style="font-size: 11px; color: #B7B4AC; text-align: center; margin-top: 24px;">
            Idioma: ${locale ?? 'ca'} · ${new Date().toLocaleString('ca-AD', { timeZone: 'Europe/Andorra' })}
          </p>
        </div>`;

      await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}` },
        body: JSON.stringify({
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_NOVA_SOLLICITUD_DE_VALORACI,
          subject: `Nova valoració CORPAND: ${nom} ${cognoms} (${input.sector})`,
          body: htmlBody,
          is_html: true,
          recipient_email: 'info@corpand.ad',
          reply_to: email,
          sender_email: appUrl ? `noreply@${new URL(appUrl).hostname}` : 'noreply@corpand.ad',
          sender_alias: 'CORPAND',
        }),
      });
    } catch (emailErr: any) {
      console.error('Valuation email failed:', emailErr?.message ?? emailErr);
    }

    return NextResponse.json({
      success: true,
      id: record.id,
      valorMin: result.valorMin,
      valorMitja: result.valorMitja,
      valorMax: result.valorMax,
      metodePrincipal: result.metodePrincipal,
    });
  } catch (err: any) {
    console.error('Valuation error:', err?.message ?? err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
