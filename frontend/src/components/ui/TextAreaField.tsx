import type { TextareaHTMLAttributes } from 'react';

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextAreaField({ className = '', ...props }: TextAreaFieldProps) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y border border-[#f0ead0]/10 bg-[#1c1c19] px-3 py-2.5 text-xs text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25 ${className}`.trim()}
    />
  );
}
