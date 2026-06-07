import type { ReactNode } from 'react';

type FieldLabelProps = {
  children: ReactNode;
  className?: string;
};

export default function FieldLabel({ children, className = '' }: FieldLabelProps) {
  return (
    <label className={`mb-1.5 block text-[9px] uppercase tracking-[0.15em] text-[#8a8474] ${className}`.trim()}>
      {children}
    </label>
  );
}
