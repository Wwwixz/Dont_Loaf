import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMotionPreference } from '../lib/motion';
const HeroScene = lazy(() => import('./HeroScene'));

export function StructureStill() {
  return <svg className="structure-still" viewBox="0 0 640 600" width="640" height="600" aria-hidden="true">
    <defs><linearGradient id="metal-face" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a8b2c6"/><stop offset=".35" stopColor="#333b4c"/><stop offset="1" stopColor="#71809c"/></linearGradient></defs>
    <g fill="none" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M125 389L272 300L414 213 M213 438L361 350L503 264" stroke="#30394d" strokeWidth="18"/>
      <path d="M125 383L272 294L414 207 M213 432L361 344L503 258" stroke="#66738e" strokeWidth="3"/>
      <path d="M125 389V250L213 300V438L125 389L242 320V183L125 250M213 300L330 232V370L213 438M242 183L330 232" stroke="#151b28" strokeWidth="28"/>
      <path d="M125 389V250L213 300V438L125 389L242 320V183L125 250M213 300L330 232V370L213 438M242 183L330 232" stroke="url(#metal-face)" strokeWidth="15"/>
      <path d="M272 300V161L360 211V350L272 300L389 231V94L272 161M360 211L477 143V281L360 350M389 94L477 143" stroke="#222936" strokeWidth="28"/>
      <path d="M272 300V161L360 211V350L272 300L389 231V94L272 161M360 211L477 143V281L360 350M389 94L477 143" stroke="url(#metal-face)" strokeWidth="15"/>
      <path d="M414 213V122L503 173V264L414 213L561 127V36L414 122M503 173L605 114V205L503 264M561 36L605 61" stroke="#2b2c43" strokeWidth="20"/>
      <path d="M272 161L360 211V350M414 122L503 173V264" stroke="#a78bfa" strokeWidth="5"/>
      <path d="M125 250L213 300V438" stroke="#6c8bff" strokeWidth="4"/>
    </g>
  </svg>;
}
class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export default function HeroStructure() {
  const host = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const [eligible, setEligible] = useState(false);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px) and (pointer: fine)');
    const update = () => setEligible(query.matches);
    update(); query.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNear(true); observer.disconnect(); } }, { rootMargin: '150px' });
    if (host.current) observer.observe(host.current);
    return () => { query.removeEventListener('change', update); observer.disconnect(); };
  }, []);
  return <div ref={host} className="hero-structure structure-premium" role="img" aria-label="Связанные металлические рамы образуют восходящую архитектурную структуру — от замысла к результату">
    <div className="structure-coordinate" aria-hidden="true"><span>СИСТЕМА / 001</span><span>ЗАМЫСЕЛ → РЕЗУЛЬТАТ</span></div>
    <div className="structure-stage">
      {eligible && near && !reduced ? <SceneBoundary fallback={<StructureStill/>}><Suspense fallback={<StructureStill/>}><HeroScene host={host}/></Suspense></SceneBoundary> : <StructureStill/>}
    </div>
    <div className="structure-caption" aria-hidden="true"><span className="structure-caption-line"/><span>КАЖДЫЙ ШАГ ИМЕЕТ ЗНАЧЕНИЕ</span><span className="structure-caption-index">01—03</span></div>
  </div>;
}
