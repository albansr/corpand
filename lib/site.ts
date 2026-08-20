/**
 * Central site configuration for CORPAND.
 *
 * IMPORTANT: The production/canonical domain is fixed to https://corpand.ad.
 * Canonical URLs, hreflang, sitemap and JSON-LD ALWAYS use this domain, never the
 * staging (abacusai.app) URL, so staging never leaks as a canonical target.
 * Staging indexability is controlled separately (see lib/seo.ts + app/robots.ts).
 */

import { getLocalePath } from '@/lib/locale-link';

// Fixed production domain (decided). Do NOT derive from NEXTAUTH_URL for canonical.
export const SITE_URL = 'https://corpand.ad';
export const PRODUCTION_HOST = 'corpand.ad';

export const SITE_NAME = 'CORPAND';
export const CONTACT_EMAIL = 'info@corpand.ad';

export const LOCALES = ['ca', 'es', 'en', 'fr', 'de', 'pt'] as const;
export type SiteLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: SiteLocale = 'ca';

// Maps hreflang language tags to internal locales (x-default -> ca).
export const HREFLANG_MAP: Record<string, string> = {
  ca: 'ca',
  es: 'es',
  en: 'en',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
};

// og:locale codes
export const OG_LOCALE: Record<string, string> = {
  ca: 'ca_AD',
  es: 'es_ES',
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_DE',
  pt: 'pt_PT',
};

export type PageKey =
  | 'home'
  | 'vendre-empresa'
  | 'comprar-empresa'
  | 'oportunitats'
  | 'metode'
  | 'corpand'
  | 'contacte'
  | 'valoracio'
  | 'perfil-inversor'
  | 'privacitat'
  | 'avis-legal'
  | 'cookies';

// Slug path per page (shared across locales; locale prefix added by getLocalePath).
export const PAGE_PATHS: Record<PageKey, string> = {
  home: '/',
  'vendre-empresa': '/vendre-empresa',
  'comprar-empresa': '/comprar-empresa',
  oportunitats: '/oportunitats',
  metode: '/metode',
  corpand: '/corpand',
  contacte: '/contacte',
  valoracio: '/valoracio',
  'perfil-inversor': '/perfil-inversor',
  privacitat: '/privacitat',
  'avis-legal': '/avis-legal',
  cookies: '/cookies',
};

// Pages that should appear in the sitemap and be indexable (all current pages).
export const INDEXABLE_PAGES: PageKey[] = [
  'home',
  'vendre-empresa',
  'comprar-empresa',
  'oportunitats',
  'metode',
  'corpand',
  'contacte',
  'valoracio',
  'perfil-inversor',
];

// Rough change frequency / priority hints for the sitemap.
export const SITEMAP_META: Record<PageKey, { priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }> = {
  home: { priority: 1.0, changeFrequency: 'weekly' },
  'vendre-empresa': { priority: 0.9, changeFrequency: 'monthly' },
  'comprar-empresa': { priority: 0.9, changeFrequency: 'monthly' },
  oportunitats: { priority: 0.8, changeFrequency: 'weekly' },
  metode: { priority: 0.7, changeFrequency: 'monthly' },
  corpand: { priority: 0.7, changeFrequency: 'monthly' },
  contacte: { priority: 0.6, changeFrequency: 'monthly' },
  valoracio: { priority: 0.9, changeFrequency: 'monthly' },
  'perfil-inversor': { priority: 0.8, changeFrequency: 'monthly' },
  privacitat: { priority: 0.3, changeFrequency: 'monthly' },
  'avis-legal': { priority: 0.2, changeFrequency: 'monthly' },
  cookies: { priority: 0.2, changeFrequency: 'monthly' },
};

/** Absolute canonical URL for a page in a given locale (no trailing slash except root). */
export function pageUrl(locale: string, page: PageKey): string {
  let path = getLocalePath(locale, PAGE_PATHS[page]);
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return `${SITE_URL}${path === '' ? '/' : path}`;
}

/** Detect whether the current request host is the production domain. */
export function isProductionHost(host?: string | null): boolean {
  if (!host) return false;
  return host.includes(PRODUCTION_HOST);
}

// ---------------------------------------------------------------------------
// Per-page SEO metadata (title + description) per locale.
// These are META descriptions for search/AI engines — NOT invented facts and
// NOT the on-page copy. Kept centralized to avoid touching page components.
// ---------------------------------------------------------------------------

type SeoText = { title: string; description: string };

export const SEO_CONTENT: Record<PageKey, Record<string, SeoText>> = {
  home: {
    ca: {
      title: 'CORPAND — Operacions corporatives a Andorra',
      description:
        "Boutique andorrana d'operacions corporatives: venda i adquisició d'empreses i implantació a Andorra. Discreció, criteri i execució.",
    },
    es: {
      title: 'CORPAND — Operaciones corporativas en Andorra',
      description:
        'Boutique andorrana de operaciones corporativas: venta y adquisición de empresas e implantación en Andorra. Discreción, criterio y ejecución.',
    },
    en: {
      title: 'CORPAND — Corporate operations in Andorra',
      description:
        'Andorran corporate-operations boutique: company sale, acquisition and business establishment in Andorra. Discretion, judgment and execution.',
    },
    fr: {
      title: 'CORPAND — Opérations corporatives en Andorre',
      description:
        "Boutique andorrane d'opérations corporatives : vente et acquisition d'entreprises et implantation en Andorre. Discrétion, jugement et exécution.",
    },
    de: {
      title: 'CORPAND — Unternehmenstransaktionen in Andorra',
      description:
        'Andorranische Boutique für Unternehmenstransaktionen: Verkauf, Akquisition und Unternehmensansiedlung in Andorra. Diskretion, Urteilsvermögen, Umsetzung.',
    },
    pt: {
      title: 'CORPAND — Operações corporativas em Andorra',
      description:
        'Boutique andorrana de operações corporativas: venda e aquisição de empresas e implantação em Andorra. Discrição, critério e execução.',
    },
  },
  'vendre-empresa': {
    ca: {
      title: 'Vendre una empresa a Andorra | CORPAND',
      description:
        "Assessorament integral en la venda de la teva empresa a Andorra: valoració, preparació, el comprador adequat i confidencialitat en tot el procés.",
    },
    es: {
      title: 'Vender una empresa en Andorra | CORPAND',
      description:
        'Asesoramiento integral en la venta de tu empresa en Andorra: valoración, preparación, el comprador adecuado y confidencialidad en todo el proceso.',
    },
    en: {
      title: 'Sell a company in Andorra | CORPAND',
      description:
        'End-to-end advice on selling your company in Andorra: valuation, preparation, the right buyer and confidentiality throughout the process.',
    },
    fr: {
      title: 'Vendre une entreprise en Andorre | CORPAND',
      description:
        "Conseil intégral pour la vente de votre entreprise en Andorre : valorisation, préparation, l'acquéreur adéquat et confidentialité.",
    },
    de: {
      title: 'Ein Unternehmen in Andorra verkaufen | CORPAND',
      description:
        'Ganzheitliche Beratung beim Verkauf Ihres Unternehmens in Andorra: Bewertung, Vorbereitung, der passende Käufer und Vertraulichkeit.',
    },
    pt: {
      title: 'Vender uma empresa em Andorra | CORPAND',
      description:
        'Assessoria integral na venda da sua empresa em Andorra: avaliação, preparação, o comprador adequado e confidencialidade em todo o processo.',
    },
  },
  'comprar-empresa': {
    ca: {
      title: 'Comprar una empresa a Andorra | CORPAND',
      description:
        "Adquisició d'empreses a Andorra amb criteri: oportunitats seleccionades, anàlisi rigorós i acompanyament durant tota l'operació.",
    },
    es: {
      title: 'Comprar una empresa en Andorra | CORPAND',
      description:
        'Adquisición de empresas en Andorra con criterio: oportunidades seleccionadas, análisis riguroso y acompañamiento durante toda la operación.',
    },
    en: {
      title: 'Buy a company in Andorra | CORPAND',
      description:
        'Acquiring companies in Andorra with judgment: selected opportunities, rigorous analysis and support throughout the entire transaction.',
    },
    fr: {
      title: 'Acheter une entreprise en Andorre | CORPAND',
      description:
        "Acquisition d'entreprises en Andorre avec discernement : opportunités sélectionnées, analyse rigoureuse et accompagnement sur toute l'opération.",
    },
    de: {
      title: 'Ein Unternehmen in Andorra kaufen | CORPAND',
      description:
        'Unternehmensakquisition in Andorra mit Urteilsvermögen: ausgewählte Gelegenheiten, sorgfältige Analyse und Begleitung während der gesamten Transaktion.',
    },
    pt: {
      title: 'Comprar uma empresa em Andorra | CORPAND',
      description:
        'Aquisição de empresas em Andorra com critério: oportunidades selecionadas, análise rigorosa e acompanhamento durante toda a operação.',
    },
  },
  oportunitats: {
    ca: {
      title: 'Oportunitats · Accés privat | CORPAND',
      description:
        'Deal flow privat compartit de manera confidencial amb inversors registrats. Operacions seleccionades a Andorra, no publicades obertament.',
    },
    es: {
      title: 'Oportunidades · Acceso privado | CORPAND',
      description:
        'Deal flow privado compartido de forma confidencial con inversores registrados. Operaciones seleccionadas en Andorra, no publicadas abiertamente.',
    },
    en: {
      title: 'Opportunities · Private access | CORPAND',
      description:
        'A private deal flow shared confidentially with registered investors. Selected opportunities in Andorra, not published openly.',
    },
    fr: {
      title: 'Opportunités · Accès privé | CORPAND',
      description:
        'Un deal flow privé partagé de manière confidentielle avec des investisseurs enregistrés. Opérations sélectionnées en Andorre, non publiées.',
    },
    de: {
      title: 'Gelegenheiten · Privater Zugang | CORPAND',
      description:
        'Ein privater Deal Flow, vertraulich mit registrierten Investoren geteilt. Ausgewählte Transaktionen in Andorra, nicht öffentlich publiziert.',
    },
    pt: {
      title: 'Oportunidades · Acesso privado | CORPAND',
      description:
        'Um deal flow privado partilhado de forma confidencial com investidores registados. Operações selecionadas em Andorra, não publicadas abertamente.',
    },
  },
  metode: {
    ca: {
      title: 'El nostre mètode | CORPAND',
      description:
        "Un procés estructurat per a cada operació corporativa: selecció, anàlisi, coordinació d'especialistes i confidencialitat com a fonament.",
    },
    es: {
      title: 'Nuestro método | CORPAND',
      description:
        'Un proceso estructurado para cada operación corporativa: selección, análisis, coordinación de especialistas y confidencialidad como fundamento.',
    },
    en: {
      title: 'Our method | CORPAND',
      description:
        'A structured process for every corporate transaction: selection, analysis, coordination of specialists and confidentiality as the foundation.',
    },
    fr: {
      title: 'Notre méthode | CORPAND',
      description:
        "Un processus structuré pour chaque opération corporative : sélection, analyse, coordination des spécialistes et confidentialité comme fondement.",
    },
    de: {
      title: 'Unsere Methode | CORPAND',
      description:
        'Ein strukturierter Prozess für jede Unternehmenstransaktion: Auswahl, Analyse, Koordination von Spezialisten und Vertraulichkeit als Fundament.',
    },
    pt: {
      title: 'O nosso método | CORPAND',
      description:
        'Um processo estruturado para cada operação corporativa: seleção, análise, coordenação de especialistas e confidencialidade como fundamento.',
    },
  },
  corpand: {
    ca: {
      title: 'CORPAND · Boutique d’operacions empresarials',
      description:
        'Qui som: una boutique andorrana centrada en operacions corporatives selectives, amb criteri, rigor i confidencialitat.',
    },
    es: {
      title: 'CORPAND · Boutique de operaciones empresariales',
      description:
        'Quiénes somos: una boutique andorrana centrada en operaciones corporativas selectivas, con criterio, rigor y confidencialidad.',
    },
    en: {
      title: 'CORPAND · Corporate operations boutique',
      description:
        'Who we are: an Andorran boutique focused on selective corporate operations, with judgment, rigor and confidentiality.',
    },
    fr: {
      title: 'CORPAND · Boutique d’opérations corporatives',
      description:
        'Qui sommes-nous : une boutique andorrane axée sur des opérations corporatives sélectives, avec discernement, rigueur et confidentialité.',
    },
    de: {
      title: 'CORPAND · Boutique für Unternehmenstransaktionen',
      description:
        'Wer wir sind: eine andorranische Boutique mit Fokus auf selektive Unternehmenstransaktionen – mit Urteilsvermögen, Sorgfalt und Vertraulichkeit.',
    },
    pt: {
      title: 'CORPAND · Boutique de operações empresariais',
      description:
        'Quem somos: uma boutique andorrana focada em operações corporativas seletivas, com critério, rigor e confidencialidade.',
    },
  },
  contacte: {
    ca: {
      title: 'Contacte confidencial | CORPAND',
      description:
        'Inicia una conversa confidencial amb CORPAND sobre la teva operació corporativa a Andorra.',
    },
    es: {
      title: 'Contacto confidencial | CORPAND',
      description:
        'Inicia una conversación confidencial con CORPAND sobre tu operación corporativa en Andorra.',
    },
    en: {
      title: 'Confidential contact | CORPAND',
      description:
        'Start a confidential conversation with CORPAND about your corporate transaction in Andorra.',
    },
    fr: {
      title: 'Contact confidentiel | CORPAND',
      description:
        'Entamez une conversation confidentielle avec CORPAND au sujet de votre opération corporative en Andorre.',
    },
    de: {
      title: 'Vertraulicher Kontakt | CORPAND',
      description:
        'Beginnen Sie ein vertrauliches Gespräch mit CORPAND über Ihre Unternehmenstransaktion in Andorra.',
    },
    pt: {
      title: 'Contacto confidencial | CORPAND',
      description:
        'Inicie uma conversa confidencial com a CORPAND sobre a sua operação corporativa em Andorra.',
    },
  },
  valoracio: {
    ca: {
      title: "Valoració d'empresa a Andorra | CORPAND",
      description:
        "Obtén una valoració orientativa de la teva empresa a Andorra en minuts. Càlcul basat en múltiples de mercat, confidencial i sense compromís.",
    },
    es: {
      title: 'Valoración de empresa en Andorra | CORPAND',
      description:
        'Obtén una valoración orientativa de tu empresa en Andorra en minutos. Cálculo basado en múltiplos de mercado, confidencial y sin compromiso.',
    },
    en: {
      title: 'Company valuation in Andorra | CORPAND',
      description:
        'Get an indicative valuation of your company in Andorra in minutes. Based on market multiples, confidential and with no obligation.',
    },
    fr: {
      title: "Valorisation d'entreprise en Andorre | CORPAND",
      description:
        "Obtenez une valorisation indicative de votre entreprise en Andorre en quelques minutes. Basée sur des multiples de marché, confidentielle et sans engagement.",
    },
    de: {
      title: 'Unternehmensbewertung in Andorra | CORPAND',
      description:
        'Erhalten Sie in wenigen Minuten eine indikative Bewertung Ihres Unternehmens in Andorra. Auf Basis von Marktmultiplikatoren, vertraulich und unverbindlich.',
    },
    pt: {
      title: 'Avaliação de empresa em Andorra | CORPAND',
      description:
        'Obtenha uma avaliação indicativa da sua empresa em Andorra em minutos. Baseada em múltiplos de mercado, confidencial e sem compromisso.',
    },
  },
  'perfil-inversor': {
    ca: {
      title: "Perfil d'inversor · Accés al deal flow privat | CORPAND",
      description:
        "Registra el teu perfil d'inversor o mandat de compra i accedeix de manera confidencial a operacions seleccionades a Andorra.",
    },
    es: {
      title: 'Perfil de inversor · Acceso al deal flow privado | CORPAND',
      description:
        'Registra tu perfil de inversor o mandato de compra y accede de forma confidencial a operaciones seleccionadas en Andorra.',
    },
    en: {
      title: 'Investor profile · Access to private deal flow | CORPAND',
      description:
        'Register your investor profile or purchase mandate and gain confidential access to selected transactions in Andorra.',
    },
    fr: {
      title: "Profil d'investisseur · Accès au deal flow privé | CORPAND",
      description:
        "Enregistrez votre profil d'investisseur ou mandat d'achat et accédez de manière confidentielle à des opérations sélectionnées en Andorre.",
    },
    de: {
      title: 'Investorenprofil · Zugang zum privaten Deal Flow | CORPAND',
      description:
        'Registrieren Sie Ihr Investorenprofil oder Kaufmandat und erhalten Sie vertraulichen Zugang zu ausgewählten Transaktionen in Andorra.',
    },
    pt: {
      title: 'Perfil de investidor · Acesso ao deal flow privado | CORPAND',
      description:
        'Registe o seu perfil de investidor ou mandato de compra e aceda de forma confidencial a operações selecionadas em Andorra.',
    },
  },
  privacitat: {
    ca: {
      title: 'Privacitat i protecció de dades | CORPAND',
      description:
        'Com CORPAND tracta, protegeix i conserva les teves dades i la documentació de la teva empresa amb la màxima confidencialitat.',
    },
    es: {
      title: 'Privacidad y protección de datos | CORPAND',
      description:
        'Cómo CORPAND trata, protege y conserva tus datos y la documentación de tu empresa con la máxima confidencialidad.',
    },
    en: {
      title: 'Privacy & data protection | CORPAND',
      description:
        'How CORPAND processes, protects and retains your data and your company documentation with the utmost confidentiality.',
    },
    fr: {
      title: 'Confidentialité et protection des données | CORPAND',
      description:
        'Comment CORPAND traite, protège et conserve vos données et la documentation de votre entreprise avec la plus grande confidentialité.',
    },
    de: {
      title: 'Datenschutz & Datensicherheit | CORPAND',
      description:
        'Wie CORPAND Ihre Daten und die Unterlagen Ihres Unternehmens mit höchster Vertraulichkeit verarbeitet, schützt und aufbewahrt.',
    },
    pt: {
      title: 'Privacidade e proteção de dados | CORPAND',
      description:
        'Como a CORPAND trata, protege e conserva os seus dados e a documentação da sua empresa com a máxima confidencialidade.',
    },
  },
  'avis-legal': {
    ca: {
      title: 'Avís legal | CORPAND',
      description:
        'Informació legal, titularitat del lloc web, condicions d’ús i responsabilitat de CORPAND, boutique d’operacions corporatives a Andorra.',
    },
    es: {
      title: 'Aviso legal | CORPAND',
      description:
        'Información legal, titularidad del sitio web, condiciones de uso y responsabilidad de CORPAND, boutique de operaciones corporativas en Andorra.',
    },
    en: {
      title: 'Legal notice | CORPAND',
      description:
        'Legal information, website ownership, terms of use and liability of CORPAND, a corporate-operations boutique in Andorra.',
    },
    fr: {
      title: 'Mentions légales | CORPAND',
      description:
        'Informations légales, propriété du site web, conditions d’utilisation et responsabilité de CORPAND, boutique d’opérations corporatives en Andorre.',
    },
    de: {
      title: 'Impressum | CORPAND',
      description:
        'Rechtliche Angaben, Eigentum der Website, Nutzungsbedingungen und Haftung von CORPAND, einer Boutique für Unternehmenstransaktionen in Andorra.',
    },
    pt: {
      title: 'Aviso legal | CORPAND',
      description:
        'Informação legal, titularidade do site, condições de uso e responsabilidade da CORPAND, boutique de operações corporativas em Andorra.',
    },
  },
  cookies: {
    ca: {
      title: 'Política de cookies | CORPAND',
      description:
        'Quines cookies utilitza el lloc web de CORPAND, amb quina finalitat i com pots configurar-les o retirar el teu consentiment.',
    },
    es: {
      title: 'Política de cookies | CORPAND',
      description:
        'Qué cookies utiliza el sitio web de CORPAND, con qué finalidad y cómo puedes configurarlas o retirar tu consentimiento.',
    },
    en: {
      title: 'Cookie policy | CORPAND',
      description:
        'Which cookies the CORPAND website uses, for what purpose and how you can configure them or withdraw your consent.',
    },
    fr: {
      title: 'Politique de cookies | CORPAND',
      description:
        'Quels cookies le site web de CORPAND utilise, dans quel but et comment les configurer ou retirer votre consentement.',
    },
    de: {
      title: 'Cookie-Richtlinie | CORPAND',
      description:
        'Welche Cookies die CORPAND-Website verwendet, zu welchem Zweck und wie Sie diese konfigurieren oder Ihre Einwilligung widerrufen können.',
    },
    pt: {
      title: 'Política de cookies | CORPAND',
      description:
        'Que cookies o site da CORPAND utiliza, com que finalidade e como pode configurá-las ou retirar o seu consentimento.',
    },
  },
};

export function getSeo(page: PageKey, locale: string): SeoText {
  const byLocale = SEO_CONTENT[page];
  return byLocale[locale] ?? byLocale[DEFAULT_LOCALE];
}
