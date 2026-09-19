import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 18, text: 'text-base' },
  md: { icon: 22, text: 'text-xl' },
  lg: { icon: 28, text: 'text-2xl' },
};

export default function Logo({ size = 'md' }: LogoProps) {
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2 select-none">
      <span className="flex items-center justify-center rounded-lg bg-primary/15 text-primary p-1.5">
        <Sparkles size={s.icon} strokeWidth={2.2} />
      </span>
      <span className={`font-semibold tracking-tight text-text ${s.text}`}>DontLoaf</span>
    </div>
  );
}
