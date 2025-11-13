import React, { useRef, useCallback, useEffect } from 'react';

export default function ImagePreview({
                                         imageSrc,
                                         colorPickerMode = false,
                                         onColorPick,
                                         showColorPickerHint = false
                                     }) {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    const handleImageClick = useCallback((event) => {
        if (!colorPickerMode || !canvasRef.current || !imageRef.current || !onColorPick) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = imageRef.current.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const canvasX = Math.floor(x * scaleX);
        const canvasY = Math.floor(y * scaleY);

        if (canvasX < 0 || canvasX >= canvas.width || canvasY < 0 || canvasY >= canvas.height) return;

        const imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
        const [r, g, b] = imageData.data;

        onColorPick({ red: r, green: g, blue: b });
    }, [colorPickerMode, onColorPick]);

    const loadImageToCanvas = useCallback(() => {
        if (!imageSrc || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };

        img.src = imageSrc;
    }, [imageSrc]);

    useEffect(() => {
        loadImageToCanvas();
    }, [loadImageToCanvas]);

    if (!imageSrc) return null;

    const topOffset = 80;
    const bottomOffset = 160;

    return (
        <div className="relative inline-block">
            {/* Hint для режима пипетки */}
            {colorPickerMode && showColorPickerHint && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-blue-600 text-white px-3 py-2 text-sm rounded-t flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                        <path d="M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.93-1.41 1.41 1.93 1.93L3.29 16.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.17 11.6l1.93 1.93 1.41-1.41-1.93-1.93 3.13-3.12c.38-.38.38-1.02-.01-1.44zM6.83 18.36l-.94-.94 8.48-8.48.94.94-8.48 8.48z"/>
                    </svg>
                    Click on the image to pick a color
                </div>
            )}

            <div
                className={`border-2 rounded mt-4 transition-all duration-200 ${
                    colorPickerMode
                        ? 'border-blue-500 shadow-lg ring-2 ring-blue-500 ring-opacity-50'
                        : 'border-blue-500'
                }`}
                style={{
                    maxWidth: '100%',
                    maxHeight: `calc(100vh - ${topOffset + bottomOffset}px)`,
                    marginTop: colorPickerMode && showColorPickerHint ? '0' : '16px'
                }}
            >
                <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Preview"
                    onClick={handleImageClick}
                    className={`block transition-all duration-200 ${
                        colorPickerMode ? 'cursor-crosshair' : 'cursor-default'
                    }`}
                    style={{
                        display: 'block',
                        maxWidth: '100%',
                        maxHeight: `calc(100vh - ${topOffset + bottomOffset}px)`,
                        height: 'auto',
                        width: 'auto',
                    }}
                />
            </div>

            <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
            />
        </div>
    );
}