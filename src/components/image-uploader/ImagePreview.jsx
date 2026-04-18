import React, { useRef, useCallback, useEffect } from 'react';

export default function ImagePreview({
                                         imageSrc,
                                         colorPickerMode = false,
                                         onColorPick,
                                         showColorPickerHint = false,
                                         manualTool = null,
                                         manualConfig = null,
                                         onManualEdit,
                                     }) {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const isDrawingRef = useRef(false);
    const pointsRef = useRef([]);

    const getCanvasCoords = useCallback((event) => {
        if (!canvasRef.current || !imageRef.current) return null;

        const canvas = canvasRef.current;
        const rect = imageRef.current.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mappedX = Math.floor(x * scaleX);
        const mappedY = Math.floor(y * scaleY);

        if (
            mappedX < 0 ||
            mappedX >= canvas.width ||
            mappedY < 0 ||
            mappedY >= canvas.height
        ) {
            return null;
        }

        return {
            x: mappedX,
            y: mappedY,
        };
    }, []);

    const handleImageClick = useCallback((event) => {
        const coords = getCanvasCoords(event);
        if (!coords) return;

        if (colorPickerMode && canvasRef.current && onColorPick) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            const pixel = ctx.getImageData(coords.x, coords.y, 1, 1).data;

            onColorPick({
                red: pixel[0],
                green: pixel[1],
                blue: pixel[2],
            });
            return;
        }

        if (manualTool === "COLOR_FILL" && manualConfig && onManualEdit) {
            onManualEdit("COLOR_FILL", {
                x: coords.x,
                y: coords.y,
                color: manualConfig.color,
                tolerance: manualConfig.tolerance,
            });
        }
    }, [colorPickerMode, getCanvasCoords, onColorPick, manualTool, manualConfig, onManualEdit]);

    const loadImageToCanvas = useCallback(() => {
        if (!imageSrc || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };

        img.src = imageSrc;
    }, [imageSrc]);

    const handlePointerDown = useCallback((event) => {
        if (!manualTool || !["BRUSH", "ERASER"].includes(manualTool)) return;

        const coords = getCanvasCoords(event);
        if (!coords) return;

        isDrawingRef.current = true;
        pointsRef.current = [coords];
    }, [manualTool, getCanvasCoords]);

    const handlePointerMove = useCallback((event) => {
        if (!isDrawingRef.current) return;
        if (!manualTool || !["BRUSH", "ERASER"].includes(manualTool)) return;

        const coords = getCanvasCoords(event);
        if (!coords) return;

        pointsRef.current.push(coords);
    }, [manualTool, getCanvasCoords]);

    const handlePointerUp = useCallback(() => {
        if (!isDrawingRef.current) return;

        isDrawingRef.current = false;

        if (!manualTool || !manualConfig || !onManualEdit) {
            pointsRef.current = [];
            return;
        }

        const points = [...pointsRef.current];
        pointsRef.current = [];

        if (points.length < 2) return;

        if (manualTool === "BRUSH") {
            onManualEdit("BRUSH", {
                color: manualConfig.color,
                size: manualConfig.size,
                opacity: manualConfig.opacity,
                points,
            });
            return;
        }

        if (manualTool === "ERASER") {
            onManualEdit("ERASER", {
                size: manualConfig.size,
                opacity: manualConfig.opacity ?? 1.0,
                points,
            });
        }
    }, [manualTool, manualConfig, onManualEdit]);

    useEffect(() => {
        loadImageToCanvas();
    }, [loadImageToCanvas]);

    if (!imageSrc) return null;

    const topOffset = 80;
    const bottomOffset = 160;
    const interactiveMode = colorPickerMode || ["BRUSH", "ERASER", "COLOR_FILL"].includes(manualTool);

    return (
        <div className="relative inline-block">
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
                    interactiveMode
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
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    className={`block transition-all duration-200 ${
                        interactiveMode ? 'cursor-crosshair' : 'cursor-default'
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