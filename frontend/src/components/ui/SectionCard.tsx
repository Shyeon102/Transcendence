import type { ReactNode } from 'react';

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export default function SectionCard({ children, className = '' }: SectionCardProps) {
  return (
    <section className={`border border-[#f0ead0]/10 bg-[#141412] ${className}`.trim()}>
      {children}
    </section>
  );
}
