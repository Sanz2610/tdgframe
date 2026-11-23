import type { CSSProperties } from 'react';

const paths = {
  upload: <><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></>,
  download: <><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></>,
  reset: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 16 5-5 5 5 3-3 5 5"/></>,
  move: <><path d="M12 2v20M2 12h20M8 6l4-4 4 4M8 18l4 4 4-4M6 8l-4 4 4 4m12-8 4 4-4 4"/></>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  share: <><path d="M12 16V3m-4 4 4-4 4 4M6 10H4v11h16V10h-2"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5.8-1.5 1.5-1.5 2M12 17h.01"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
  minus: <path d="M5 12h14"/>,
  plus: <path d="M5 12h14M12 5v14"/>,
};

export type IconName = keyof typeof paths;
export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
