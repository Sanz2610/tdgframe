import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function Modal({ title, onClose, children, className = '' }: {
  title: string; onClose: () => void; children: ReactNode; className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current!;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return <dialog ref={dialog} className={`modal ${className}`} aria-labelledby="modal-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-inner">
      <div className="modal-heading"><h2 id="modal-title">{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close"/></button>
      </div>
      {children}
    </div>
  </dialog>;
}
