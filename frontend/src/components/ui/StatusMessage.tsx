type StatusMessageProps = {
  children: string;
  tone?: 'error' | 'success';
  className?: string;
};

const toneClassMap = {
  error: 'text-[#ff4f38]',
  success: 'text-[#6bbf72]',
} as const;

export default function StatusMessage({
  children,
  tone = 'error',
  className = '',
}: StatusMessageProps) {
  return (
    <p className={`text-[11px] tracking-[0.06em] ${toneClassMap[tone]} ${className}`.trim()}>
      {children}
    </p>
  );
}
