import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatEur } from '@/lib/valuation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const LANG_NAME: Record<string, string> = {
  ca: 'català', es: 'espanyol (castellà)', en: 'anglès', fr: 'francès', de: 'alemany', pt: 'portuguès',
};

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });

    const r = await prisma.valuationRequest.findUnique({ where: { id: String(id) } });
    if (!r) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    if (r.informeIA) {
      return NextResponse.json({ success: true, report: r.informeIA });
    }

    const locale = r.locale || 'ca';
    const lang = LANG_NAME[locale] || 'català';

    const facts = [
      `Sector: ${r.sector}`,
      `Facturació anual: ${formatEur(r.facturacio, locale)}`,
      r.ebitda != null ? `EBITDA: ${formatEur(r.ebitda, locale)}` : null,
      r.beneficiNet != null ? `Benefici net: ${formatEur(r.beneficiNet, locale)}` : null,
      r.deuteFinancer != null ? `Deute financer: ${formatEur(r.deuteFinancer, locale)}` : null,
      r.tresoreria != null ? `Tresoreria: ${formatEur(r.tresoreria, locale)}` : null,
      r.patrimoniNet != null ? `Patrimoni net: ${formatEur(r.patrimoniNet, locale)}` : null,
      r.empleats != null ? `Empleats: ${r.empleats}` : null,
      r.anysActivitat != null ? `Anys d'activitat: ${r.anysActivitat}` : null,
      r.creixement ? `Creixement: ${r.creixement}` : null,
      r.recurrencia ? `Recurrència d'ingressos: ${r.recurrencia}` : null,
    ].filter(Boolean).join('\n');

    const range = `${formatEur(r.valorMin ?? 0, locale)} – ${formatEur(r.valorMax ?? 0, locale)} (valor central orientatiu ${formatEur(r.valorMitja ?? 0, locale)})`;

    const systemPrompt = `Ets un analista sènior d'una boutique andorrana d'operacions corporatives (M&A) anomenada CORPAND. Escrius un breu informe explicatiu que acompanya una valoració orientativa preliminar d'una empresa. El rang de valoració JA ha estat calculat per un motor determinista intern basat en múltiples de mercat (EV/EBITDA, EV/facturació) i patrimoni net ajustat; NO l'has de recalcular ni contradir. La teva feina és NARRAR i CONTEXTUALITZAR el resultat de manera professional, sòbria i creïble.

REGLES ESTRICTES:
- Escriu íntegrament en ${lang}.
- To boutique: precís, sobri, sense floritures de màrqueting ni superlatius. Confiança tranquil·la.
- És una valoració ORIENTATIVA i NO VINCULANT. Deixa-ho clar sense repetir-ho excessivament.
- NO revelis marges interns, fórmules propietàries ni criteris de negociació de CORPAND. Parla de metodologia de mercat en termes generals (múltiples sectorials, deute net, patrimoni).
- NO inventis dades que no s'han facilitat. Si falta EBITDA o altres dades, esmenta que una valoració refinada requeriria documentació addicional.
- No prometis un preu de venda; el mercat i el comprador adequat determinen el valor final.
- Estructura amb 3-4 paràgrafs curts o seccions amb encapçalaments breus. Màxim ~350 paraules.
- Tanca convidant discretament a una conversa confidencial amb CORPAND i a aportar la documentació completa per a una valoració refinada.`;

    const userPrompt = `Dades aportades per l'empresari:\n${facts}\n\nRang de valoració calculat pel motor intern: ${range}.\nMètode principal aplicat: ${r.metodePrincipal}.\nRedacta l'informe explicatiu.`;

    let report = '';
    try {
      const resp = await fetch('https://apps.abacus.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.5,
          max_tokens: 900,
        }),
      });
      const data = await resp.json();
      report = data?.choices?.[0]?.message?.content?.trim() || '';
    } catch (aiErr: any) {
      console.error('AI report failed:', aiErr?.message ?? aiErr);
    }

    if (report) {
      await prisma.valuationRequest.update({ where: { id: r.id }, data: { informeIA: report } });
    }

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error('Report route error:', err?.message ?? err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
