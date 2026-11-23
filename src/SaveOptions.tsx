import { useState } from 'react';
import { Icon } from './Icon';
import { canSharePhoto, isIOSDevice } from './saving';
import type { ExportedPhoto } from './saving';

export function SaveOptions({ result, expanded = false }: { result: ExportedPhoto; expanded?: boolean }) {
  const [message, setMessage] = useState('');
  const [sharing, setSharing] = useState(false);
  const inZalo = /zalo/i.test(navigator.userAgent);
  const ios = isIOSDevice();
  const canShare = canSharePhoto(result.file);

  async function share() {
    // The file is prepared BEFORE this tap: no encode/fetch before navigator.share.
    try {
      setSharing(true);
      await navigator.share({ files: [result.file] });
      setMessage('Bạn có thể mở lại menu để lưu hoặc chia sẻ ảnh.');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setMessage('Bạn có thể lưu lại bất cứ lúc nào.');
      } else {
        setMessage('Menu chia sẻ chưa khả dụng. Bạn tải trực tiếp hoặc nhấn giữ ảnh để lưu nha.');
      }
    } finally { setSharing(false); }
  }

  return <details className="save-options" open={expanded || undefined}>
    <summary>Cách lưu khác</summary>
    <div className="save-options-content">
      <img className="result-image" src={result.url} alt="Ảnh TDG đã ghép — nhấn giữ để lưu"/>
      <p className="result-spec">PNG · 2048 × 2048 px</p>
      {inZalo ? <div className="save-hint">Đang mở trong Zalo? Nhấn giữ ảnh để lưu. Nếu chưa được, chọn <strong>••• → Mở bằng trình duyệt</strong>, rồi tạo ảnh tại Safari hoặc Chrome.</div> : null}
      {canShare ? <button className="button button-primary" onClick={share} disabled={sharing}>
        <Icon name="share"/>{sharing ? 'Đang mở…' : 'Lưu vào Ảnh / Chia sẻ'}</button> : null}
      <a className={`button ${canShare ? 'button-secondary' : 'button-primary'}`} href={result.url}
        download={result.file.name} onClick={() => setMessage('Đã gửi yêu cầu tải. Nếu ảnh chưa lưu, bạn nhấn giữ ảnh bên trên nha.')}>
        <Icon name="download"/>{ios ? 'Tải file PNG vào Tệp' : 'Tải ảnh PNG'}</a>
      <p className="save-instruction">Hoặc nhấn giữ ảnh bên trên → Lưu hình ảnh.</p>
      <p className="save-message" role="status">{message}</p>
    </div>
  </details>;
}
