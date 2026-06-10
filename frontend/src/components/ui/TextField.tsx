import type { InputHTMLAttributes } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement>;

export default function TextField({ className = '', ...props }: TextFieldProps) {
  return (
    <input
      {...props}
      className={`w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-3 py-2.5 text-xs text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25 ${className}`.trim()}
    />
  );
}
