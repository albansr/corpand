import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  isValidEmail,
  sanitizeString,
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
    if (!checkRateLimit(`investor:${getClientIp(request)}`)) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }

    const data = await request.json();

    if (isHoneypotTripped(data)) {
      return NextResponse.json({ success: true });
    }

    const nom = sanitizeString(data?.nom, 120);
    const cognoms = sanitizeString(data?.cognoms, 120);
    const email = sanitizeString(data?.email, 254);
    const telefon = sanitizeString(data?.telefon, 40);
    const entitat = sanitizeString(data?.entitat, 160);
    const tipusInversor = sanitizeString(data?.tipusInversor, 80);
    const tipusOperacio = sanitizeString(data?.tipusOperacio, 80);
    const horitzo = sanitizeString(data?.horitzo, 80);
    const zonaGeografica = sanitizeString(data?.zonaGeografica, 120);
    const criteris = sanitizeString(data?.criteris, 4000);
    const locale = sanitizeString(data?.locale, 5) || 'ca';
    const { sectorsInteres, tiquetMin, tiquetMax, consentPrivacitat, consentComercial, politicaVersio } = data ?? {};

    if (!nom || !cognoms || !email || !tipusInversor || !sectorsInteres) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 });
    }
    if (!consentPrivacitat) {
      return NextResponse.json({ success: false, message: 'Consent required' }, { status: 400 });
    }

    const sectors = sanitizeString(
      Array.isArray(sectorsInteres) ? sectorsInteres.join(', ') : String(sectorsInteres),
      500
    );

    const record = await prisma.investorProfile.create({
      data: {
        nom,
        cognoms,
        email,
        telefon: telefon || null,
        entitat: entitat || null,
        tipusInversor,
        sectorsInteres: sectors,
        tiquetMin: num(tiquetMin),
        tiquetMax: num(tiquetMax),
        tipusOperacio: tipusOperacio || null,
        horitzo: horitzo || null,
        zonaGeografica: zonaGeografica || null,
        criteris: criteris || null,
        locale,
        consentPrivacitat: Boolean(consentPrivacitat),
        consentComercial: Boolean(consentComercial),
        politicaVersio: typeof politicaVersio === 'string' ? politicaVersio.slice(0, 40) : null,
        status: 'nou',
      },
    });

    try {
      const appUrl = process.env.NEXTAUTH_URL ?? '';
      const htmlBody = `
        <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F6F4EF; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 22px; letter-spacing: 0.3em; font-weight: 300; color: #0B1D2D; margin: 0;">CORPAND</h1>
            <div style="width: 40px; height: 1px; background: #C9A66B; margin: 12px auto;"></div>
            <p style="font-size: 10px; letter-spacing: 0.2em; color: #B7B4AC; margin: 0;">NOU PERFIL D'INVERSOR</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 4px; border-left: 3px solid #C9A66B;">
            <h2 style="font-size: 16px; font-weight: 400; color: #222427; margin: 0 0 16px 0;">Nou perfil d'inversor / comprador</h2>
            <table style="width: 100%; font-size: 14px; color: #222427;">
              <tr><td style="padding: 6px 0; color: #B7B4AC; width: 150px;">Nom:</td><td style="padding: 6px 0;">${escapeHtml(nom)} ${escapeHtml(cognoms)}</td></tr>
              <tr><td style="padding: 6px 0; color: #B7B4AC;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #C9A66B;">${escapeHtml(email)}</a></td></tr>
              ${telefon ? `<tr><td style="padding: 6px 0; color: #B7B4AC;">Telèfon:</td><td style="padding: 6px 0;">${escapeHtml(telefon)}</td></tr>` : ''}
              ${entitat ? `<tr><td style="padding: 6px 0; color: #B7B4AC;">Entitat:</td><td style="padding: 6px 0;">${escapeHtml(entitat)}</td></tr>` : ''}
              <tr><td style="padding: 6px 0; color: #B7B4AC;">Tipus inversor:</td><td style="padding: 6px 0;">${escapeHtml(tipusInversor)}</td></tr>
              <tr><td style="padding: 6px 0; color: #B7B4AC;">Sectors:</td><td style="padding: 6px 0;">${escapeHtml(sectors)}</td></tr>
              ${tiquetMin || tiquetMax ? `<tr><td style="padding: 6px 0; color: #B7B4AC;">Tiquet:</td><td style="padding: 6px 0;">${escapeHtml(String(tiquetMin ?? '–'))} – ${escapeHtml(String(tiquetMax ?? '–'))}</td></tr>` : ''}
            </table>
            ${criteris ? `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #F6F4EF;"><p style="font-size: 12px; color: #B7B4AC; margin: 0 0 8px 0;">Criteris:</p><p style="font-size: 14px; color: #222427; margin: 0; line-height: 1.6;">${escapeHtml(criteris)}</p></div>` : ''}
          </div>
          <p style="font-size: 11px; color: #B7B4AC; text-align: center; margin-top: 24px;">
            Idioma: ${locale ?? 'ca'} · ID: ${record.id} · ${new Date().toLocaleString('ca-AD', { timeZone: 'Europe/Andorra' })}
          </p>
        </div>`;

      await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}` },
        body: JSON.stringify({
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_NOU_PERFIL_DINVERSOR,
          subject: `Nou inversor CORPAND: ${nom} ${cognoms}`.slice(0, 180),
          body: htmlBody,
          is_html: true,
          recipient_email: 'info@corpand.ad',
          reply_to: email,
          sender_email: appUrl ? `noreply@${new URL(appUrl).hostname}` : 'noreply@corpand.ad',
          sender_alias: 'CORPAND',
        }),
      });
    } catch (emailErr: any) {
      console.error('Investor email failed:', emailErr?.message ?? emailErr);
    }

    return NextResponse.json({ success: true, id: record.id });
  } catch (err: any) {
    console.error('Investor error:', err?.message ?? err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
