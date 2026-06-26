import type { ReactNode } from 'react';

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description?: string;
  title: string;
};

export default function EmptyState({
  action,
  className = '',
  description,
  title,
}: EmptyStateProps) {
  return (
    <div className={`border border-[#f0ead0]/10 bg-[#141412] px-5 py-6 text-center ${className}`.trim()}>
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#c8c2a8]">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-[#8a8474]">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
