import React, { useEffect, useRef, useState } from "react";

export default function PriorityBrushMask({
                                              imageSrc,
                                              size = 256,
                                              brushSize = 24,
                                              onMaskReady,
                                          }) {
    const visibleCanvasRef = useRef(null);
    const maskCanvasRef = useRef(null);
    const drawingRef = useRef(false);

    const [image, setImage] = useState(null);
    const [currentBrushSize, setCurrentBrushSize] = useState(brushSize);

    useEffect(() => {
        if (!imageSrc) return;

        const img = new Image();
        img.onload = () => setImage(img);
        img.src = imageSrc;
    }, [imageSrc]);

    useEffect(() => {
        if (!image) return;

        const canvas = visibleCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;

        if (!canvas || !maskCanvas) return;

        canvas.width = size;
        canvas.height = size;
        maskCanvas.width = size;
        maskCanvas.height = size;

        const ctx = canvas.getContext("2d");
        const maskCtx = maskCanvas.getContext("2d");

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(image, 0, 0, size, size);

        maskCtx.fillStyle = "black";
        maskCtx.fillRect(0, 0, size, size);
    }, [image, size]);

    const getCanvasPoint = (event) => {
        const canvas = visibleCanvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const clientX = event.touches?.[0]?.clientX ?? event.clientX;
        const clientY = event.touches?.[0]?.clientY ?? event.clientY;

        const x = ((clientX - rect.left) / rect.width) * size;
        const y = ((clientY - rect.top) / rect.height) * size;

        return { x, y };
    };

    const drawPoint = (event) => {
        if (!drawingRef.current) return;

        event.preventDefault();

        const canvas = visibleCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;

        const ctx = canvas.getContext("2d");
        const maskCtx = maskCanvas.getContext("2d");

        const { x, y } = getCanvasPoint(event);

        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x, y, currentBrushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        maskCtx.fillStyle = "white";
        maskCtx.beginPath();
        maskCtx.arc(x, y, currentBrushSize / 2, 0, Math.PI * 2);
        maskCtx.fill();
    };

    const startDrawing = (event) => {
        drawingRef.current = true;
        drawPoint(event);
    };

    const stopDrawing = () => {
        drawingRef.current = false;
        exportMask();
    };

    const clearMask = () => {
        const canvas = visibleCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;

        const ctx = canvas.getContext("2d");
        const maskCtx = maskCanvas.getContext("2d");

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(image, 0, 0, size, size);

        maskCtx.fillStyle = "black";
        maskCtx.fillRect(0, 0, size, size);

        onMaskReady?.(null);
    };

    const exportMask = () => {
        const maskCanvas = maskCanvasRef.current;

        maskCanvas.toBlob((blob) => {
            if (!blob) {
                onMaskReady?.(null);
                return;
            }

            const file = new File([blob], "priority-mask.png", {
                type: "image/png",
            });

            onMaskReady?.(file);
        }, "image/png");
    };

    return (
        <div className="space-y-2">
            <div className="rounded-lg bg-slate-200 p-2 flex justify-center">
                <canvas
                    ref={visibleCanvasRef}
                    className="max-w-full rounded border border-blue-100 cursor-crosshair touch-none"
                    style={{
                        width: "256px",
                        height: "256px",
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={drawPoint}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={drawPoint}
                    onTouchEnd={stopDrawing}
                />

                <canvas ref={maskCanvasRef} className="hidden" />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Brush size: {currentBrushSize}px
                </label>

                <input
                    type="range"
                    min="6"
                    max="80"
                    step="1"
                    value={currentBrushSize}
                    onChange={(event) => setCurrentBrushSize(Number(event.target.value))}
                    className="w-full"
                />
            </div>

            <button
                type="button"
                onClick={clearMask}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
                Clear priority mask
            </button>
        </div>
    );
}