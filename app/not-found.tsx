import Link from 'next/link';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata = {
  title: 'Pàgina no trobada | CORPAND',
  robots: { index: false, follow: false },
};

/**
 * Branded 404. As an app-router not-found page it returns a real HTTP 404 status.
 * The root layout renders children directly, so this page provides its own html/body.
 */
export default function NotFound() {
  return (
    <html lang="ca">
      <body className={`${montserrat.className} bg-navy text-offwhite antialiased`}>
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <span className="text-offwhite text-sm md:text-base font-light tracking-[0.3em]">CORPAND</span>
          <div className="w-12 h-px bg-gold my-8" />
          <p className="text-6xl md:text-7xl font-light text-gold tracking-wide">404</p>
          <h1 className="mt-6 text-xl md:text-2xl font-light text-offwhite tracking-wide">
            Aquesta pàgina no existeix
          </h1>
          <p className="mt-4 max-w-md text-sm font-light text-stone leading-relaxed">
            La pàgina que busques no està disponible o s’ha mogut. Torna a l’inici per continuar.
          </p>
          <Link
            href="/"
            className="inline-block mt-10 px-8 py-3 border border-gold text-gold text-sm font-normal tracking-wider uppercase rounded hover:bg-gold hover:text-navy transition-all duration-200"
          >
            Tornar a l’inici
          </Link>
        </main>
      </body>
    </html>
  );
}
