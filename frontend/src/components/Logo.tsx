import { Leaf } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  invert?: boolean;
}

const sizes = {
  sm: { icon: 16, text: 'text-sm' },
  md: { icon: 20, text: 'text-lg' },
  lg: { icon: 26, text: 'text-2xl' },
};

export default function Logo({ size = 'md', invert = false }: LogoProps) {
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2 select-none">
      <span className="flex items-center justify-center rounded-lg bg-primary/15 text-primary p-1.5">
        <Leaf size={s.icon} strokeWidth={2.2} />
      </span>
      <span className={`font-semibold tracking-tight ${s.text} ${invert ? 'text-invert' : 'text-text'}`}>
        DontLoaf
      </span>
    </div>
  );
}
