import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, DragEvent } from 'react';
import { Icon } from './Icon';
import { Preview } from './Preview';
import { Modal } from './Modal';
import { SaveDialog } from './SaveDialog';
import type { ExportedPhoto } from './SaveDialog';
import { clampTransform, exportPhoto, INITIAL, loadImage, readPhoto } from './image';
import type { Photo, Transform } from './image';

export default function App() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [frame, setFrame] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<Transform>(INITIAL);
  const [busy, setBusy] = useState<'read' | 'export' | null>(null);
  const [error, setError] = useState('');
  const [frameError, setFrameError] = useState(false);
  const [result, setResult] = useState<ExportedPhoto | null>(null);
  const [help, setHelp] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  const operation = useRef(false);
  const inZalo = /zalo/i.test(navigator.userAgent);

  useEffect(() => {
    let active = true;
    loadImage('/frame.webp').then(image => { if (active) setFrame(image); })
      .catch(() => { if (active) setFrameError(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);
  useEffect(() => () => { request.current++; }, []);

  function choose() { if (!operation.current) input.current?.click(); }
  async function upload(file: File | undefined) {
    if (!file || operation.current) return;
    operation.current = true;
    const id = ++request.current;
    setBusy('read'); setError('');
    try {
      const next = await readPhoto(file);
      if (id !== request.current) { URL.revokeObjectURL(next.url); return; }
      setPhoto(next); setTransform(INITIAL);
    } catch (cause) {
      if (id === request.current) setError(cause instanceof Error ? cause.message : 'Chưa đọc được ảnh. Bạn thử lại nha.');
    } finally {
      operation.current = false;
      if (id === request.current) setBusy(null);
    }
  }
  function change(event: ChangeEvent<HTMLInputElement>) {
    void upload(event.target.files?.[0]);
    event.target.value = '';
  }
  function drop(event: DragEvent) {
    event.preventDefault(); setDragOver(false);
    void upload(event.dataTransfer.files[0]);
  }
  async function save() {
    if (!photo || !frame || operation.current) return;
    operation.current = true;
    setBusy('export'); setError('');
    try {
      const blob = await exportPhoto(photo, frame, transform);
      const file = new File([blob], 'TDGFrame-50-ngay-than-toc.png', { type: 'image/png' });
      setResult({ file, url: URL.createObjectURL(blob) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chưa xuất được ảnh. Bạn thử lại nha.');
    } finally { operation.current = false; setBusy(null); }
  }
  function zoom(value: number) {
    if (photo) setTransform(clampTransform({ ...transform, zoom: value }, photo.fit));
  }

  return <div className="site-shell">
    <header className="site-header">
      <a className="brand" href="/" aria-label="TDGFrame — trang chủ">
        <svg className="brand-mark" width="33" height="33" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <path d="M4 13V4h9M21 4h9v9M30 21v9h-9M13 30H4v-9" stroke="currentColor" strokeWidth="3"/>
          <path d="m12 12 10 5-10 5V12Z" fill="currentColor"/>
        </svg><span>TDG<span className="brand-light">Frame</span><span className="brand-dot">.</span></span>
      </a>
      <button className="help-button" aria-label="Cách lưu ảnh" onClick={() => setHelp(true)}><Icon name="help" size={18}/><span>Cách lưu ảnh</span></button>
    </header>

    <main className="editor-layout">
      <div className="intro">
        <h1><span className="title-start">Vào khung.</span><br/><span className="title-accent">Bứt phá cùng TDG.</span></h1>
        <p>Một chiếc avatar. Cùng một tinh thần.</p>
      </div>

      <Preview photo={photo} frame={frame} transform={transform} onTransform={setTransform}
        onChoose={choose} busy={!!busy}/>

      <section className="tools" aria-label="Tùy chỉnh ảnh">
        <div className="section-label"><span className="step-number">01</span><h2>Chọn ảnh của bạn</h2></div>
        <input ref={input} id="photo-input" className="file-input" type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif" onChange={change} disabled={!!busy} aria-label="Chọn ảnh của bạn"/>
        <button className={`upload-button ${dragOver ? 'drag-over' : ''}`} onClick={choose} disabled={!!busy}
          onDragOver={event => { event.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)} onDrop={drop}>
          <span className="upload-icon">{busy === 'read' ? <span className="spinner"/> : <Icon name={photo ? 'image' : 'upload'} size={22}/>}</span>
          <span><strong>{busy === 'read' ? 'Đang đọc ảnh…' : photo ? 'Đổi ảnh khác' : 'Chọn ảnh từ thiết bị'}</strong><small>JPG, PNG, WebP, HEIC · Tối đa 30 MB</small></span>
          <Icon name="plus" size={20}/>
        </button>

        <div className={`adjustment ${photo ? '' : 'inactive'}`}>
          <div className="section-label adjust-title"><span className="step-number">02</span><h2>Canh cho thật nét</h2>
            <button className="reset-button" disabled={!photo || !!busy} onClick={() => setTransform(INITIAL)} aria-label="Đặt lại vị trí và zoom"><Icon name="reset" size={15}/>Đặt lại</button>
          </div>
          <div className="zoom-label"><label htmlFor="zoom">Thu phóng</label><output htmlFor="zoom">{Math.round(transform.zoom * 100)}<span>%</span></output></div>
          <div className="zoom-control">
            <button className="icon-button zoom-step" aria-label="Thu nhỏ ảnh" disabled={!photo || !!busy || transform.zoom <= 1}
              onClick={() => zoom(Math.max(1, transform.zoom - 0.1))}><Icon name="minus" size={17}/></button>
            <input id="zoom" type="range" min="100" max="1000" step="1" value={Math.round(transform.zoom * 100)}
              aria-valuetext={`${Math.round(transform.zoom * 100)} phần trăm`} disabled={!photo || !!busy}
              onChange={event => zoom(Number(event.target.value) / 100)}
              style={{ '--range-progress': `${(transform.zoom - 1) / 9 * 100}%` } as CSSProperties}/>
            <button className="icon-button zoom-step" aria-label="Phóng to ảnh" disabled={!photo || !!busy || transform.zoom >= 10}
              onClick={() => zoom(Math.min(10, transform.zoom + 0.1))}><Icon name="plus" size={17}/></button>
          </div>
        </div>

        <button className="button button-primary export-button" disabled={!photo || !frame || !!busy} onClick={save}>
          {busy === 'export' ? <span className="spinner"/> : <Icon name="download" size={21}/>}
          {busy === 'export' ? 'Đang tạo ảnh…' : 'Tải ảnh của bạn'}<Icon name="arrow" size={19}/>
        </button>
        <div className="output-note">PNG chất lượng cao<span>2048 × 2048 px</span></div>
        <p className="error-message" role="alert">{error}</p>
        {frameError ? <div className="frame-error" role="alert">Chưa tải được khung. Kiểm tra kết nối rồi <button className="text-button" onClick={() => location.reload()}>thử lại</button>.</div> : null}
        {inZalo ? <p className="zalo-note">Mở bằng Zalo: sau khi tạo ảnh, nhấn giữ ảnh để lưu. <button className="text-button" onClick={() => setHelp(true)}>Xem cách lưu</button></p> : null}
      </section>
    </main>

    <footer className="site-footer"><span className="footer-brand">TDG PROPERTY</span><span><Icon name="lock" size={12}/>Ảnh chỉ xử lý trên thiết bị của bạn.</span></footer>

    {result ? <SaveDialog result={result} onClose={() => setResult(null)}/> : null}
    {help ? <Modal title="Lưu ảnh thật đơn giản" onClose={() => setHelp(false)}>
      <ol className="help-list">
        <li><strong>Chọn ảnh & canh khung</strong><p>Kéo ảnh để đổi vị trí. Dùng thanh thu phóng hoặc chụm hai ngón để zoom tới 1000%.</p></li>
        <li><strong>Nhấn “Tải ảnh của bạn”</strong><p>Ảnh PNG sẽ hiện ra để bạn kiểm tra trước khi lưu.</p></li>
        <li><strong>iPhone / iPad</strong><p>Chọn “Lưu vào Ảnh / Chia sẻ” → “Lưu hình ảnh”. Hoặc nhấn giữ ảnh để lưu. Nếu chọn tải PNG, ảnh có thể nằm trong ứng dụng Tệp → Tải về.</p></li>
        <li><strong>Android</strong><p>Chọn “Tải ảnh PNG”. Kiểm tra thư mục Download / Tải xuống; hoặc dùng menu chia sẻ để lưu.</p></li>
        <li><strong>Trình duyệt trong Zalo</strong><p>Nhấn giữ ảnh kết quả → lưu ảnh. Nếu Zalo không cho lưu, chọn ••• → mở bằng trình duyệt, rồi chọn ảnh lại tại Safari hoặc Chrome.</p></li>
      </ol>
      <button className="button button-primary" onClick={() => setHelp(false)}>Đã hiểu<Icon name="check" size={18}/></button>
    </Modal> : null}
  </div>;
}
