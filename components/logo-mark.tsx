export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span
        className="text-2xl md:text-3xl font-light tracking-[0.35em] leading-none"
        style={{ fontFamily: 'var(--font-montserrat)' }}
      >
        CORPAND
      </span>
      <div className="w-12 h-px bg-gold my-2" />
      <span className="text-[10px] md:text-xs font-light tracking-[0.25em] uppercase opacity-80">
        Operacions Empresarials · Andorra
      </span>
    </div>
  );
}
