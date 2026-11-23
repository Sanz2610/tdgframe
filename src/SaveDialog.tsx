import { useState } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';

export type ExportedPhoto = { url: string; file: File };
export function SaveDialog({ result, onClose }: { result: ExportedPhoto; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [sharing, setSharing] = useState(false);
  const inZalo = /zalo/i.test(navigator.userAgent);
  const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let canShare = false;
  try { canShare = !!navigator.canShare?.({ files: [result.file] }); } catch { /* unavailable webview */ }

  async function share() {
    // The file is prepared BEFORE this tap: no encode/fetch before navigator.share.
    try {
      setSharing(true);
      await navigator.share({ files: [result.file], title: 'TDGFrame' });
      setMessage('Đã mở menu chia sẻ. Chọn “Lưu hình ảnh” để lưu vào máy.');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setMessage('Bạn có thể lưu lại bất cứ lúc nào.');
      } else {
        setMessage('Menu chia sẻ chưa khả dụng. Bạn tải trực tiếp hoặc nhấn giữ ảnh để lưu nha.');
      }
    } finally { setSharing(false); }
  }

  return <Modal title="Ảnh đã sẵn sàng" onClose={onClose} className="save-modal">
    <img className="result-image" src={result.url} alt="Ảnh TDG đã ghép — nhấn giữ để lưu"/>
    <p className="result-spec">PNG · 2048 × 2048 px</p>
    {inZalo ? <div className="save-hint">Đang mở trong Zalo? Nhấn giữ ảnh để lưu. Nếu chưa được, chọn <strong>••• → Mở bằng trình duyệt</strong>, rồi tạo ảnh tại Safari hoặc Chrome.</div> : null}
    {mobile && canShare ? <button className="button button-primary" onClick={share} disabled={sharing}>
      <Icon name="share"/>{sharing ? 'Đang mở…' : 'Lưu vào Ảnh / Chia sẻ'}</button> : null}
    <a className={`button ${mobile && canShare ? 'button-secondary' : 'button-primary'}`} href={result.url}
      download={result.file.name} onClick={() => setMessage('Đã gửi yêu cầu tải. Nếu ảnh chưa lưu, bạn nhấn giữ ảnh bên trên nha.')}>
      <Icon name="download"/>Tải ảnh PNG</a>
    {canShare && !mobile ? <button className="text-button share-desktop" onClick={share} disabled={sharing}>
      <Icon name="share" size={16}/>Chia sẻ ảnh</button> : null}
    <p className="save-instruction">{mobile ? 'Hoặc nhấn giữ ảnh bên trên → Lưu hình ảnh.' : 'Ảnh được lưu vào thư mục tải xuống của trình duyệt.'}</p>
    <p className="save-message" role="status">{message}</p>
  </Modal>;
}
