import { GoldDivider } from './gold-divider';

interface HeroSectionProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

export function HeroSection({
  imageUrl,
  title,
  subtitle,
  children,
  compact = false,
}: HeroSectionProps) {
  return (
    <section
      className={`relative flex items-center justify-center ${
        compact ? 'min-h-[60vh]' : 'min-h-screen'
      }`}
    >
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-navy/75" />
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-offwhite tracking-wide leading-tight">
          {title}
        </h1>
        {subtitle && (
          <>
            <GoldDivider className="mx-auto mt-8 mb-6" />
            <p className="text-base md:text-lg text-stone font-light tracking-wide">
              {subtitle}
            </p>
          </>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}
