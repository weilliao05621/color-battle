import { ROUND_TIME_MS } from '@color-battle/shared';

interface TimerProps {
  remainingMs: number;
}

export function Timer({ remainingMs }: TimerProps) {
  const seconds = Math.ceil(remainingMs / 1000);
  const progress = remainingMs / ROUND_TIME_MS;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - progress);

  const getColor = () => {
    if (seconds <= 3) return '#ef4444';
    if (seconds <= 5) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        <circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span
        className={`text-2xl font-bold ${seconds <= 3 ? 'animate-pulse-fast text-red-400' : 'text-white'}`}
      >
        {seconds}
      </span>
    </div>
  );
}
