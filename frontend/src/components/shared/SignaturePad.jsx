import { useRef, useState, useEffect } from 'react';

export default function SignaturePad({ onSave, onClear, label = "Signature" }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a'; // Dark blue for professional ink feel
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    return { x, y };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    onSave(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onClear();
  };

  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          style={{ width: '100%', height: 150, cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
           <button type="button" className="btn btn-ghost btn-sm" onClick={clear} style={{ fontSize: 11, padding: '4px 8px' }}>
             Effacer
           </button>
        </div>
        {!hasContent && (
           <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0.3, fontSize: 13, color: 'var(--gray-400)' }}>
             Signez ici 
           </div>
        )}
      </div>
    </div>
  );
}
