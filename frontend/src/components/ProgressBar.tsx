import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-sm text-gray-600">
          <span>Прогресс</span>
          <span className="font-medium">
            {value} / {max}
          </span>
        </div>
      )}
      <div
        className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', {
          'h-1': size === 'sm',
          'h-2': size === 'md',
          'h-3': size === 'lg',
        })}
      >
        <div
          className={clsx('h-full transition-all duration-300 ease-out', {
            'bg-primary-600': variant === 'default',
            'bg-green-600': variant === 'success',
            'bg-yellow-600': variant === 'warning',
            'bg-red-600': variant === 'danger',
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
