import { useRef, useEffect } from 'react';
import { log } from '../utils/logger.js';

export default function Canvas({ currentBp, onClick }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (currentBp) {
      drawAll(currentBp);
    }
  }, [currentBp]);
  
  function drawAll(bp) {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);
    if (!bp || !bp.points || bp.points.length === 0) {
      log.canvas('Canvas cleared - no points to draw');
      return;
    }
    
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    bp.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    
    // Draw points as circles
    ctx.fillStyle = '#dc2626';
    bp.points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    log.canvas(`Drew ${bp.points.length} points on canvas`);
  }
  
  function handleClick(e) {
    const rect = e.target.getBoundingClientRect();
    const point = { 
      x: Math.round(e.clientX - rect.left), 
      y: Math.round(e.clientY - rect.top) 
    };
    log.canvas(`Point clicked: (${point.x}, ${point.y})`);
    onClick?.(point);
  }
  
  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border:'2px solid #ddd', 
          borderRadius:8, 
          cursor:'crosshair', 
          display:'block'
        }}
        onClick={handleClick}
      />
      <p style={{opacity:.7, marginTop:8, fontSize:14}}>
        👆 Haz clic en el canvas para agregar puntos
      </p>
    </div>
  );
}
