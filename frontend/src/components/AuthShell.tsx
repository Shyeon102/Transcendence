import type { ReactNode } from 'react';

interface AuthShellProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  backgroundText: string;
  children: ReactNode;
}

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  backgroundText,
  children,
}: AuthShellProps) {
  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-85px)] w-full items-center justify-center overflow-hidden bg-[#0c0c0b] px-6 py-16 text-[#f0ead0]">
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-['Bebas_Neue'] text-[clamp(120px,20vw,220px)] tracking-[-0.02em] text-[#f0ead0]/[0.025]">
        {backgroundText}
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#d63e2a]">{eyebrow}</p>
        <h1 className="mb-2 font-['Bebas_Neue'] text-[52px] leading-none tracking-[0.03em] text-[#f0ead0]">
          {title}
        </h1>
        <p className="mb-9 font-['IBM_Plex_Serif'] text-sm font-light italic text-[#8a8474]">
          {subtitle}
        </p>
        <div className="mb-9 h-0.5 w-10 bg-[#d63e2a]" />
        {children}
      </div>
    </section>
  );
}
