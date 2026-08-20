/**
 * CORPAND — Deterministic company valuation engine.
 *
 * The valuation is computed by a transparent, rule-based formula (NOT by an AI
 * guessing a number). An LLM is only used afterwards to write the explanatory
 * narrative around these computed figures.
 *
 * Methods combined:
 *   1. EBITDA multiple  -> EV = EBITDA x sector multiple; Equity = EV - net debt  (primary)
 *   2. Revenue multiple -> EV = revenue x sector multiple; Equity = EV - net debt  (contrast)
 *   3. Adjusted NAV     -> equity floor for asset-heavy / property groups
 *
 * Output is always a RANGE (min / central / max), never a single binding figure.
 *
 * ---------------------------------------------------------------------------
 * SECTOR_MULTIPLES is intentionally kept here in code so CORPAND can review and
 * edit the assumptions at any time. Values are conservative, orientative ranges
 * for privately-held SMEs and are NOT a market quote.
 * ---------------------------------------------------------------------------
 */

export interface SectorMultiple {
  /** key used by the form + i18n */
  key: string;
  /** EV / EBITDA multiple band */
  ebitdaMin: number;
  ebitdaMax: number;
  /** EV / Revenue multiple band (contrast method) */
  revenueMin: number;
  revenueMax: number;
  /** whether the sector is asset-heavy (NAV becomes a meaningful floor) */
  assetHeavy?: boolean;
}

export const SECTOR_MULTIPLES: SectorMultiple[] = [
  { key: 'tecnologia', ebitdaMin: 6, ebitdaMax: 10, revenueMin: 1.5, revenueMax: 3.5 },
  { key: 'salut', ebitdaMin: 5, ebitdaMax: 8, revenueMin: 0.8, revenueMax: 1.8 },
  { key: 'serveis', ebitdaMin: 4, ebitdaMax: 7, revenueMin: 0.6, revenueMax: 1.2 },
  { key: 'turisme', ebitdaMin: 4, ebitdaMax: 7, revenueMin: 0.8, revenueMax: 2.0 },
  { key: 'hostaleria', ebitdaMin: 3.5, ebitdaMax: 6, revenueMin: 0.5, revenueMax: 1.2 },
  { key: 'immobiliari', ebitdaMin: 8, ebitdaMax: 14, revenueMin: 2.0, revenueMax: 5.0, assetHeavy: true },
  { key: 'construccio', ebitdaMin: 3, ebitdaMax: 5, revenueMin: 0.3, revenueMax: 0.7, assetHeavy: true },
  { key: 'industria', ebitdaMin: 4, ebitdaMax: 6.5, revenueMin: 0.5, revenueMax: 1.0, assetHeavy: true },
  { key: 'distribucio', ebitdaMin: 4, ebitdaMax: 6, revenueMin: 0.3, revenueMax: 0.7 },
  { key: 'comerc', ebitdaMin: 3, ebitdaMax: 5, revenueMin: 0.3, revenueMax: 0.8 },
  { key: 'financer', ebitdaMin: 5, ebitdaMax: 9, revenueMin: 1.0, revenueMax: 2.5 },
  { key: 'alimentacio', ebitdaMin: 4, ebitdaMax: 7, revenueMin: 0.5, revenueMax: 1.2 },
  { key: 'automocio', ebitdaMin: 3, ebitdaMax: 5, revenueMin: 0.2, revenueMax: 0.5 },
  { key: 'educacio', ebitdaMin: 4, ebitdaMax: 7, revenueMin: 0.8, revenueMax: 1.8 },
  { key: 'altres', ebitdaMin: 4, ebitdaMax: 6, revenueMin: 0.4, revenueMax: 0.9 },
];

export const SECTOR_KEYS = SECTOR_MULTIPLES.map((s) => s.key);

export type Creixement = 'negatiu' | 'estable' | 'moderat' | 'alt';
export type Recurrencia = 'baixa' | 'mitjana' | 'alta';

export interface ValuationInput {
  sector: string;
  facturacio: number; // required, annual revenue (EUR)
  ebitda?: number | null;
  beneficiNet?: number | null;
  deuteFinancer?: number | null;
  tresoreria?: number | null;
  patrimoniNet?: number | null;
  empleats?: number | null;
  anysActivitat?: number | null;
  creixement?: Creixement | string | null;
  recurrencia?: Recurrencia | string | null;
}

export interface ValuationResult {
  valorMin: number;
  valorMitja: number;
  valorMax: number;
  metodePrincipal: 'ebitda' | 'facturacio' | 'patrimoni';
  ebitdaMultipleMin: number;
  ebitdaMultipleMax: number;
  netDebt: number;
  // contrast figures (for the narrative, not shown as headline)
  evEbitdaMin: number;
  evEbitdaMax: number;
  navFloor: number | null;
}

function getSector(key: string): SectorMultiple {
  return SECTOR_MULTIPLES.find((s) => s.key === key) || SECTOR_MULTIPLES[SECTOR_MULTIPLES.length - 1];
}

function clampPositive(n: number): number {
  return n > 0 ? n : 0;
}

/**
 * Qualitative position within the multiple band, 0 (low) .. 1 (high).
 * Starts at the mid-point and is nudged by growth, recurrence, size and age.
 */
function bandPosition(input: ValuationInput): number {
  let pos = 0.5;

  switch ((input.creixement || '').toString()) {
    case 'alt':
      pos += 0.18;
      break;
    case 'moderat':
      pos += 0.08;
      break;
    case 'estable':
      break;
    case 'negatiu':
      pos -= 0.18;
      break;
  }

  switch ((input.recurrencia || '').toString()) {
    case 'alta':
      pos += 0.15;
      break;
    case 'mitjana':
      pos += 0.04;
      break;
    case 'baixa':
      pos -= 0.1;
      break;
  }

  // Size premium: larger businesses trade at higher multiples.
  const rev = input.facturacio || 0;
  if (rev >= 10_000_000) pos += 0.12;
  else if (rev >= 5_000_000) pos += 0.07;
  else if (rev >= 2_000_000) pos += 0.03;
  else if (rev < 500_000) pos -= 0.08;

  // Track record / stability.
  const anys = input.anysActivitat || 0;
  if (anys >= 15) pos += 0.06;
  else if (anys >= 8) pos += 0.03;
  else if (anys > 0 && anys < 3) pos -= 0.08;

  return Math.max(0.05, Math.min(0.95, pos));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Compute the deterministic valuation range.
 */
export function computeValuation(input: ValuationInput): ValuationResult {
  const sector = getSector(input.sector);
  const revenue = clampPositive(input.facturacio || 0);
  const ebitda = input.ebitda ?? null;
  const netDebt = (input.deuteFinancer || 0) - (input.tresoreria || 0);
  const nav = input.patrimoniNet != null ? input.patrimoniNet : null;

  const pos = bandPosition(input);

  // --- EBITDA multiple method -------------------------------------------------
  const hasEbitda = ebitda != null && ebitda > 0;
  const evEbitdaLow = hasEbitda ? (ebitda as number) * sector.ebitdaMin : 0;
  const evEbitdaHigh = hasEbitda ? (ebitda as number) * sector.ebitdaMax : 0;
  const equityEbitdaLow = evEbitdaLow - netDebt;
  const equityEbitdaHigh = evEbitdaHigh - netDebt;

  // --- Revenue multiple method ------------------------------------------------
  const evRevLow = revenue * sector.revenueMin;
  const evRevHigh = revenue * sector.revenueMax;
  const equityRevLow = evRevLow - netDebt;
  const equityRevHigh = evRevHigh - netDebt;

  // --- Choose primary method --------------------------------------------------
  let metodePrincipal: ValuationResult['metodePrincipal'];
  let baseLow: number;
  let baseHigh: number;

  if (hasEbitda) {
    metodePrincipal = 'ebitda';
    // Blend mostly EBITDA with a light revenue contrast to avoid outliers.
    baseLow = lerp(equityEbitdaLow, equityRevLow, 0.25);
    baseHigh = lerp(equityEbitdaHigh, equityRevHigh, 0.25);
  } else {
    metodePrincipal = 'facturacio';
    baseLow = equityRevLow;
    baseHigh = equityRevHigh;
  }

  // Central estimate positioned within the band by qualitative factors.
  let central = lerp(baseLow, baseHigh, pos);

  // --- Adjusted NAV floor -----------------------------------------------------
  let navFloor: number | null = null;
  if (nav != null && nav > 0) {
    // For asset-heavy sectors NAV is a strong floor; otherwise a soft reference.
    navFloor = sector.assetHeavy ? nav : nav * 0.6;
    if (central < navFloor) {
      central = navFloor;
      metodePrincipal = 'patrimoni';
    }
  }

  let valorMin = Math.min(baseLow, central);
  let valorMax = Math.max(baseHigh, central);
  let valorMitja = central;

  // Never present negative equity: floor to NAV or to a small fraction of EV.
  if (navFloor != null) {
    valorMin = Math.max(valorMin, navFloor * 0.85);
  }
  valorMin = clampPositive(valorMin);
  valorMitja = clampPositive(valorMitja);
  valorMax = clampPositive(valorMax);
  if (valorMitja < valorMin) valorMitja = valorMin;
  if (valorMax < valorMitja) valorMax = valorMitja;

  const round = (n: number) => Math.round(n / 1000) * 1000;

  return {
    valorMin: round(valorMin),
    valorMitja: round(valorMitja),
    valorMax: round(valorMax),
    metodePrincipal,
    ebitdaMultipleMin: sector.ebitdaMin,
    ebitdaMultipleMax: sector.ebitdaMax,
    netDebt: round(netDebt),
    evEbitdaMin: round(evEbitdaLow),
    evEbitdaMax: round(evEbitdaHigh),
    navFloor: navFloor != null ? round(navFloor) : null,
  };
}

/** Format an amount as compact EUR for display. */
export function formatEur(n: number, locale = 'ca'): string {
  const localeMap: Record<string, string> = {
    ca: 'ca-ES', es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', pt: 'pt-PT',
  };
  return new Intl.NumberFormat(localeMap[locale] || 'ca-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}
