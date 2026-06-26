type LoadingSkeletonProps = {
  className?: string;
};

export default function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#f0ead0]/10 ${className}`.trim()}
    />
  );
}
