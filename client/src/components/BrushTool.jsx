import React, { useRef, useEffect, useState } from 'react';
import { FaTimes, FaUndo, FaCheck } from 'react-icons/fa';

const BrushTool = ({ onClose, onSave }) => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext('2d');
    context.strokeStyle = '#a855f7'; // পার্পল রঙ
    context.lineWidth = 6;
    context.lineCap = 'round';
    setCtx(context);
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50">
      <div className="absolute top-4 right-4 flex gap-3">
        <button onClick={() => onClose()} className="p-3 bg-red-500 rounded-full text-white"><FaTimes /></button>
        <button onClick={() => onSave(canvasRef.current.toDataURL())} className="p-3 bg-green-500 rounded-full text-white"><FaCheck /></button>
      </div>
      <canvas 
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={() => setIsDrawing(false)}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
};

export default BrushTool;