interface LogoProps { size?: 'sm' | 'md' | 'lg'; invert?: boolean }
export default function Logo({ size = 'md' }: LogoProps) {
  return <span className={`brand brand-${size}`}>
    <span className="brand-mark" aria-hidden="true"><span/><span/><span/></span>
    <span className="brand-name">DontLoaf<span className="brand-dot">.</span></span>
  </span>;
}
