'use client';

import Script from 'next/script';
import { useConsent } from '@/components/consent-provider';

/**
 * Consent-gated analytics loader (GA4 and/or Google Tag Manager).
 *
 * PRIOR BLOCKING: nothing loads until the visitor has actively granted the
 * “analítiques” category. NO hard-coded / invented IDs — renders nothing unless
 * the corresponding environment variable is set:
 *   - NEXT_PUBLIC_GA_ID   (e.g. G-XXXXXXXXXX)   -> GA4 via gtag.js
 *   - NEXT_PUBLIC_GTM_ID  (e.g. GTM-XXXXXXX)    -> Google Tag Manager
 * Until real IDs are provided AND consent is granted, analytics stays inert.
 */
export function Analytics() {
  const { consent } = useConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  const analyticsAllowed = consent?.categories.analitiques === true;
  if (!analyticsAllowed) return null;

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
          </Script>
        </>
      ) : null}

      {gtmId ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      ) : null}
    </>
  );
}
