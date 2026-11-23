import { useEffect, useRef } from 'react';
import type { KeyboardEvent, PointerEvent, WheelEvent } from 'react';
import { clampTransform, paint, zoomAt } from './image';
import type { Photo, Point, Transform } from './image';
import { Icon } from './Icon';

type Props = {
  photo: Photo | null; frame: HTMLImageElement | null; transform: Transform;
  onTransform: (value: Transform) => void; onChoose: () => void; busy: boolean;
};
export function Preview({ photo, frame, transform, onTransform, onChoose, busy }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const current = useRef(transform);
  current.current = transform;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (canvas.current && frame) paint(canvas.current, photo, frame, transform);
    });
    return () => cancelAnimationFrame(id);
  }, [photo, frame, transform]);

  function commit(value: Transform) {
    if (!photo) return;
    const next = clampTransform(value, photo.fit);
    current.current = next;
    onTransform(next);
  }
  function point(event: PointerEvent): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.width - 0.5 };
  }
  function start(event: PointerEvent<HTMLDivElement>) {
    if (!photo || busy) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, point(event));
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId) || !photo) return;
    const previous = pointers.current.get(event.pointerId)!;
    const next = point(event);
    const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)?.[1];
    if (other) {
      const oldDistance = Math.hypot(previous.x - other.x, previous.y - other.y);
      const newDistance = Math.hypot(next.x - other.x, next.y - other.y);
      if (oldDistance > 0.005) {
        const oldMid = { x: (previous.x + other.x) / 2, y: (previous.y + other.y) / 2 };
        const newMid = { x: (next.x + other.x) / 2, y: (next.y + other.y) / 2 };
        const value = zoomAt(current.current, current.current.zoom * newDistance / oldDistance, oldMid);
        commit({ ...value, x: value.x + newMid.x - oldMid.x, y: value.y + newMid.y - oldMid.y });
      }
    } else {
      commit({ ...current.current, x: current.current.x + next.x - previous.x,
        y: current.current.y + next.y - previous.y });
    }
    pointers.current.set(event.pointerId, next);
  }
  function end(event: PointerEvent<HTMLDivElement>) { pointers.current.delete(event.pointerId); }
  function key(event: KeyboardEvent<HTMLDivElement>) {
    const delta = ({ ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0],
      ArrowUp: [0, -0.01], ArrowDown: [0, 0.01] } as Record<string, number[]>)[event.key];
    if (delta && photo && !busy) {
      event.preventDefault();
      commit({ ...current.current, x: current.current.x + delta[0], y: current.current.y + delta[1] });
    }
  }
  function wheel(event: WheelEvent<HTMLDivElement>) {
    if (photo && event.ctrlKey) commit(zoomAt(current.current,
      current.current.zoom * Math.exp(-event.deltaY * 0.002), { x: 0, y: 0 }));
  }

  return <section className="preview-area" aria-label="Xem trước ảnh">
    <div className="preview-meta"><span><span className="live-dot"/>XEM TRƯỚC</span><span>1:1</span></div>
    <div className={`preview-stage ${photo ? 'has-photo' : ''}`}>
      <div className="preview" role="group" tabIndex={photo ? 0 : -1}
        aria-label="Canh ảnh: kéo hoặc dùng phím mũi tên để di chuyển, chụm hai ngón để zoom"
        onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
        onLostPointerCapture={end} onKeyDown={key} onWheel={wheel}>
        <canvas ref={canvas} width="1024" height="1024" aria-label="Ảnh của bạn lồng trong khung TDG"/>
        {!photo && frame ? <button className="preview-empty" onClick={onChoose} disabled={busy}>
          <span className="empty-icon"><Icon name="image" size={29}/><span>+</span></span>
          <span>Ảnh của bạn ở đây</span>
        </button> : null}
        {!frame ? <div className="preview-loading"><span className="spinner"/>Đang tải khung…</div> : null}
      </div>
      <span className="corner corner-tl"/><span className="corner corner-tr"/>
      <span className="corner corner-bl"/><span className="corner corner-br"/>
    </div>
    <div className="preview-caption"><Icon name="move" size={14}/><span>Kéo để canh ảnh · Chụm để zoom</span></div>
  </section>;
}
