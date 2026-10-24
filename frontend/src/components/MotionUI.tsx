import { LazyMotion, domAnimation, MotionConfig, m } from 'motion/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useMotionSettings } from '../lib/motion';

export function MotionScope({ children }: { children: ReactNode }) {
  const { reduced, transition } = useMotionSettings();
  return <LazyMotion features={domAnimation} strict><MotionConfig reducedMotion={reduced ? 'always' : 'never'} transition={transition}>{children}</MotionConfig></LazyMotion>;
}

export function ProgressRing({ value, label, size = 'normal' }: { value: number; label: string; size?: 'normal' | 'small' }) {
  const { reduced } = useMotionSettings();
  const percent = Math.max(0, Math.min(100, value));
  return <div className={`progress-orbit progress-orbit-${size}`} role="progressbar" aria-label={label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
    <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="5"/>
      <m.circle cx="60" cy="60" r="52" fill="none" stroke="var(--violet)" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="100" initial={false} animate={{ strokeDashoffset: 100 - percent }} transition={{ duration: reduced ? 0 : .38 }} transform="rotate(-90 60 60)"/>
    </svg>
    <span className="progress-orbit-value od-nowrap">{Math.round(percent)}<small>%</small></span>
  </div>;
}

export function ConfirmDialog({ open, title, description, busy, error, onCancel, onConfirm }: {
  open: boolean; title: string; description: string; busy: boolean; error?: string; onCancel: () => void; onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const id = useId();
  const { reduced } = useMotionSettings();
  useEffect(() => {
    if (open && !dialog.current?.open) {
      returnFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
      cancel.current?.focus();
    }
  }, [open]);
  function close() { dialog.current?.close(); if (returnFocus.current?.isConnected) returnFocus.current.focus(); }
  useEffect(() => { if (!open && reduced) close(); }, [open, reduced]);
  return <dialog ref={dialog} className="confirm-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={e => { e.preventDefault(); if (!busy) onCancel(); }} onClick={e => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
    <m.div className="confirm-content" initial={false} animate={{ opacity: open ? 1 : 0, y: open || reduced ? 0 : 12, scale: open || reduced ? 1 : .98 }} transition={{ duration: reduced ? 0 : open ? .26 : .16 }} onAnimationComplete={() => { if (!open) close(); }}>
      <div className="od-row"><span className="eyebrow od-fill">ПОДТВЕРЖДЕНИЕ</span><button type="button" className="icon-btn" disabled={busy} aria-label="Закрыть" onClick={onCancel}><X className="od-icon"/></button></div>
      <h2 id={`${id}-title`}>{title}</h2><p id={`${id}-description`}>{description}</p>
      {error && <div className="notice" role="alert">{error}</div>}
      <div className="confirm-actions"><button ref={cancel} type="button" className="btn btn-secondary" disabled={busy} onClick={onCancel}>Отмена</button><button type="button" className="btn btn-danger" disabled={busy} onClick={onConfirm}>{busy ? 'Удаление…' : 'Удалить'}</button></div>
    </m.div>
  </dialog>;
}
