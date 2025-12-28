interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Spinner({ size = 'md', color = '#FFFFFF' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-t-transparent`}
      style={{ borderColor: `${color}40`, borderTopColor: color }}
    />
  );
}

