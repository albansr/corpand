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

export async function POST(request: Request) {
  try {
    // Best-effort rate limiting (anti-spam)
    if (!checkRateLimit(`contact:${getClientIp(request)}`)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      );
    }

    const data = await request.json();

    // Honeypot: silently accept bots without persisting
    if (isHoneypotTripped(data)) {
      return NextResponse.json({ success: true });
    }

    const nom = sanitizeString(data?.nom, 120);
    const cognoms = sanitizeString(data?.cognoms, 120);
    const email = sanitizeString(data?.email, 254);
    const telefon = sanitizeString(data?.telefon, 40);
    const tipusOperacio = sanitizeString(data?.tipusOperacio, 80);
    const missatge = sanitizeString(data?.missatge, 4000);
    const consentPrivacitat = Boolean(data?.consentPrivacitat);
    const consentComercial = Boolean(data?.consentComercial);
    const politicaVersio = sanitizeString(data?.politicaVersio, 40) || null;
    const locale = sanitizeString(data?.locale, 5) || 'ca';

    if (!nom || !cognoms || !email || !tipusOperacio || !missatge) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email' },
        { status: 400 }
      );
    }

    // Consent to the privacy policy is mandatory to process the request.
    if (!consentPrivacitat) {
      return NextResponse.json(
        { success: false, message: 'Privacy consent required' },
        { status: 400 }
      );
    }

    // Save to database
    await prisma.contactSubmission.create({
      data: {
        nom,
        cognoms,
        email,
        telefon: telefon || null,
        tipusOperacio,
        missatge,
        confidencial: true,
        consentPrivacitat,
        consentComercial,
        politicaVersio,
        locale,
        status: 'nou',
      },
    });

    // Send notification email
    try {
      const appUrl = process.env.NEXTAUTH_URL ?? '';
      const appName = 'CORPAND';

      const htmlBody = `
        <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F6F4EF; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 22px; letter-spacing: 0.3em; font-weight: 300; color: #0B1D2D; margin: 0;">CORPAND</h1>
            <div style="width: 40px; height: 1px; background: #C9A66B; margin: 12px auto;"></div>
            <p style="font-size: 10px; letter-spacing: 0.2em; color: #B7B4AC; margin: 0;">OPERACIONS EMPRESARIALS · ANDORRA</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 4px; border-left: 3px solid #C9A66B;">
            <h2 style="font-size: 16px; font-weight: 400; color: #222427; margin: 0 0 16px 0;">Nova consulta rebuda</h2>
            <table style="width: 100%; font-size: 14px; color: #222427;">
              <tr><td style="padding: 6px 0; color: #B7B4AC; width: 120px;">Nom:</td><td style="padding: 6px 0;">${escapeHtml(nom)} ${escapeHtml(cognoms)}</td></tr>
              <tr><td style="padding: 6px 0; color: #B7B4AC;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #C9A66B;">${escapeHtml(email)}</a></td></tr>
              ${telefon ? `<tr><td style="padding: 6px 0; color: #B7B4AC;">Tel\u00e8fon:</td><td style="padding: 6px 0;">${escapeHtml(telefon)}</td></tr>` : ''}
              <tr><td style="padding: 6px 0; color: #B7B4AC;">Tipus:</td><td style="padding: 6px 0;">${escapeHtml(tipusOperacio)}</td></tr>
            </table>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #F6F4EF;">
              <p style="font-size: 12px; color: #B7B4AC; margin: 0 0 8px 0;">Missatge:</p>
              <p style="font-size: 14px; color: #222427; margin: 0; line-height: 1.6;">${escapeHtml(missatge)}</p>
            </div>
          </div>
          <p style="font-size: 11px; color: #B7B4AC; text-align: center; margin-top: 24px;">
            Idioma: ${locale ?? 'ca'} · ${new Date().toLocaleString('ca-AD', { timeZone: 'Europe/Andorra' })}
          </p>
        </div>
      `;

      await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_FORMULARI_DE_CONTACTE_CORPAND,
          subject: `Nova consulta CORPAND: ${nom} ${cognoms} (${tipusOperacio})`.slice(0, 180),
          body: htmlBody,
          is_html: true,
          recipient_email: 'info@corpand.ad',
          reply_to: email,
          sender_email: appUrl ? `noreply@${new URL(appUrl).hostname}` : 'noreply@corpand.ad',
          sender_alias: appName,
        }),
      });
    } catch (emailErr: any) {
      console.error('Email notification failed:', emailErr?.message ?? emailErr);
      // Don't fail the form submission if email fails
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Contact form error:', err?.message ?? err);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
