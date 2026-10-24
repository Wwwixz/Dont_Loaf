import { useSyncExternalStore } from 'react';

export const motionTokens = {
  fast: .18,
  normal: .26,
  slow: .38,
  stagger: .04,
  ease: [.22, 1, .36, 1] as const,
};

function subscribe(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  query.addEventListener('change', callback);
  return () => { observer.disconnect(); query.removeEventListener('change', callback); };
}
function snapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
}
// Start with a stationary SSR presentation, then adopt both user preferences.
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, snapshot, () => true);
}
export function useMotionSettings() {
  const reduced = useMotionPreference();
  return { reduced, transition: { duration: reduced ? 0 : motionTokens.normal, ease: motionTokens.ease } };
}
