import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const baseClass =
  'inline-flex items-center justify-center gap-2 text-center uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-60';

const sizeClassMap = {
  sm: 'px-3 py-2 text-[9px]',
  md: 'px-4 py-3 text-[10px]',
} as const;

const variantClassMap = {
  primary: 'border border-[#d63e2a] bg-[#d63e2a] text-[#f0ead0] hover:border-[#ff4f38] hover:bg-[#ff4f38]',
  secondary: 'border border-[#f0ead0]/25 bg-[#1c1c19] text-[#f0ead0] hover:border-[#d63e2a] hover:bg-[#d63e2a]',
  danger: 'border border-[#d63e2a]/30 bg-transparent text-[#d63e2a]/70 hover:border-[#d63e2a] hover:text-[#ff4f38]',
  ghost: 'border border-transparent bg-transparent text-[#8a8474] hover:border-[#f0ead0]/10 hover:text-[#f0ead0]',
} as const;

export default function Button({
  children,
  className = '',
  size = 'md',
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${baseClass} ${sizeClassMap[size]} ${variantClassMap[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
