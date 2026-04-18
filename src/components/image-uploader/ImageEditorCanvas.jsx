import React, { useRef, useEffect, useState, useCallback } from "react";

function hexToRgba(hex, alpha = 1) {
    const normalized = (hex || "#000000").replace("#", "");
    const r = parseInt(normalized.substring(0, 2), 16) || 0;
    const g = parseInt(normalized.substring(2, 4), 16) || 0;
    const b = parseInt(normalized.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawBrush(ctx, action) {
    const points = action.points || [];
    if (points.length < 2) return;

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = hexToRgba(action.color, action.opacity ?? 1);
    ctx.lineWidth = action.size || 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
}

function drawEraser(ctx, action) {
    const points = action.points || [];
    if (points.length < 2) return;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = `rgba(0,0,0,${action.opacity ?? 1})`;
    ctx.lineWidth = action.size || 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
}

function drawFillPreview(ctx, action) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = action.color || "#000000";

    ctx.beginPath();
    ctx.arc(action.x, action.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(action.x, action.y, 12, 0, Math.PI * 2);
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();
}

function normalizeRect(start, end) {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    return { x, y, width, height };
}

function drawSelection(ctx, selection) {
    if (!selection || selection.type !== "SELECT_RECTANGLE") return;

    ctx.save();

    ctx.fillStyle = "rgba(37, 99, 235, 0.14)";

    ctx.fillRect(0, 0, ctx.canvas.width, selection.y);
    ctx.fillRect(
        0,
        selection.y + selection.height,
        ctx.canvas.width,
        ctx.canvas.height - (selection.y + selection.height)
    );
    ctx.fillRect(0, selection.y, selection.x, selection.height);
    ctx.fillRect(
        selection.x + selection.width,
        selection.y,
        ctx.canvas.width - (selection.x + selection.width),
        selection.height
    );

    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#2563eb";
    ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);

    ctx.setLineDash([]);
    ctx.fillStyle = "#2563eb";
    ctx.font = "12px sans-serif";
    ctx.fillText(
        `${Math.round(selection.width)} × ${Math.round(selection.height)}`,
        selection.x + 6,
        Math.max(14, selection.y - 6)
    );

    ctx.restore();
}

function drawAction(ctx, action) {
    if (!action) return;
    if (action.type === "BRUSH") drawBrush(ctx, action);
    if (action.type === "ERASER") drawEraser(ctx, action);
    if (action.type === "COLOR_FILL") drawFillPreview(ctx, action);
}

export default function ImageEditorCanvas({
                                              imageSrc,
                                              manualTool = null,
                                              manualConfig = null,
                                              onManualApplyBatch,
                                              onImageCropApply,
                                              colorPickerActive = false,
                                              onColorPick = null,
                                          }) {
    const sourceCanvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const imageElementRef = useRef(null);

    const [draftActions, setDraftActions] = useState([]);
    const [currentStroke, setCurrentStroke] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    const [selectionDraft, setSelectionDraft] = useState(null);
    const [selectionStart, setSelectionStart] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const isManualMode = ["BRUSH", "ERASER", "COLOR_FILL", "SELECT"].includes(manualTool);
    const hasDraft = draftActions.length > 0 || !!currentStroke || !!selectionDraft;

    const redrawSourceCanvas = useCallback(() => {
        const sourceCanvas = sourceCanvasRef.current;
        const img = imageElementRef.current;
        if (!sourceCanvas || !img) return;

        const ctx = sourceCanvas.getContext("2d");
        sourceCanvas.width = img.naturalWidth;
        sourceCanvas.height = img.naturalHeight;

        ctx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
        ctx.drawImage(img, 0, 0);
    }, []);

    const redrawPreviewCanvas = useCallback(() => {
        const sourceCanvas = sourceCanvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!sourceCanvas || !previewCanvas) return;

        const ctx = previewCanvas.getContext("2d");

        previewCanvas.width = sourceCanvas.width;
        previewCanvas.height = sourceCanvas.height;

        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.drawImage(sourceCanvas, 0, 0);

        draftActions.forEach((action) => drawAction(ctx, action));

        if (currentStroke) {
            drawAction(ctx, currentStroke);
        }

        if (selectionDraft) {
            drawSelection(ctx, selectionDraft);
        }
    }, [draftActions, currentStroke, selectionDraft]);

    useEffect(() => {
        if (!imageSrc) return;

        const img = new Image();
        img.onload = () => {
            imageElementRef.current = img;
            redrawSourceCanvas();

            setDraftActions([]);
            setCurrentStroke(null);
            setIsDrawing(false);

            setSelectionDraft(null);
            setSelectionStart(null);
            setIsSelecting(false);
        };
        img.src = imageSrc;
    }, [imageSrc, redrawSourceCanvas]);

    useEffect(() => {
        redrawPreviewCanvas();
    }, [redrawPreviewCanvas]);

    const getCanvasCoords = useCallback((event) => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mappedX = Math.round(x * scaleX);
        const mappedY = Math.round(y * scaleY);

        if (
            mappedX < 0 ||
            mappedY < 0 ||
            mappedX > canvas.width ||
            mappedY > canvas.height
        ) {
            return null;
        }

        return { x: mappedX, y: mappedY };
    }, []);

    const pickColorFromCanvas = useCallback((coords) => {
        const sourceCanvas = sourceCanvasRef.current;
        if (!sourceCanvas) return null;

        const ctx = sourceCanvas.getContext("2d");
        const pixel = ctx.getImageData(coords.x, coords.y, 1, 1).data;

        const [red, green, blue] = pixel;

        const hex = `#${((1 << 24) + (red << 16) + (green << 8) + blue)
            .toString(16)
            .slice(1)}`;

        return { red, green, blue, hex };
    }, []);

    const handlePointerDown = useCallback(
        (event) => {
            if (colorPickerActive) return;
            if (!manualTool || !manualConfig || isApplying) return;

            const coords = getCanvasCoords(event);
            if (!coords) return;

            if (manualTool === "SELECT") {
                if ((manualConfig.mode ?? "RECTANGLE") === "FREEHAND") {
                    return;
                }

                setSelectionStart(coords);
                setSelectionDraft({
                    type: "SELECT_RECTANGLE",
                    x: coords.x,
                    y: coords.y,
                    width: 0,
                    height: 0,
                    feather: manualConfig.feather ?? 0,
                });
                setIsSelecting(true);
                return;
            }

            if (["BRUSH", "ERASER"].includes(manualTool)) {
                if (manualTool === "BRUSH") {
                    setCurrentStroke({
                        type: "BRUSH",
                        color: manualConfig.color,
                        size: manualConfig.size,
                        opacity: manualConfig.opacity,
                        points: [coords],
                    });
                }

                if (manualTool === "ERASER") {
                    setCurrentStroke({
                        type: "ERASER",
                        size: manualConfig.size,
                        opacity: manualConfig.opacity ?? 1,
                        points: [coords],
                    });
                }

                setIsDrawing(true);
            }
        },
        [manualTool, manualConfig, getCanvasCoords, isApplying, colorPickerActive]
    );

    const handlePointerMove = useCallback(
        (event) => {
            if (colorPickerActive || isApplying) return;

            const coords = getCanvasCoords(event);
            if (!coords) return;

            if (manualTool === "SELECT" && isSelecting && selectionStart) {
                const rect = normalizeRect(selectionStart, coords);
                setSelectionDraft({
                    type: "SELECT_RECTANGLE",
                    ...rect,
                    feather: manualConfig?.feather ?? 0,
                });
                return;
            }

            if (!isDrawing || !currentStroke) return;

            setCurrentStroke((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    points: [...prev.points, coords],
                };
            });
        },
        [
            colorPickerActive,
            isApplying,
            manualTool,
            isSelecting,
            selectionStart,
            manualConfig,
            isDrawing,
            currentStroke,
            getCanvasCoords,
        ]
    );

    const handlePointerUp = useCallback(() => {
        if (colorPickerActive) return;

        if (manualTool === "SELECT" && isSelecting) {
            setIsSelecting(false);
            return;
        }

        if (!isDrawing) return;

        setIsDrawing(false);

        setCurrentStroke((prev) => {
            if (!prev) return null;

            if ((prev.points || []).length >= 2) {
                setDraftActions((draftPrev) => [...draftPrev, prev]);
            }

            return null;
        });
    }, [manualTool, isSelecting, isDrawing, colorPickerActive]);

    const handleClick = useCallback(
        (event) => {
            const coords = getCanvasCoords(event);
            if (!coords) return;

            if (colorPickerActive && onColorPick) {
                const pickedColor = pickColorFromCanvas(coords);
                if (pickedColor) {
                    onColorPick(pickedColor);
                }
                return;
            }

            if (manualTool !== "COLOR_FILL" || !manualConfig || isApplying) return;

            const fillAction = {
                type: "COLOR_FILL",
                x: coords.x,
                y: coords.y,
                color: manualConfig.color,
                tolerance: manualConfig.tolerance,
            };

            setDraftActions((prev) => [...prev, fillAction]);
        },
        [
            manualTool,
            manualConfig,
            getCanvasCoords,
            isApplying,
            colorPickerActive,
            onColorPick,
            pickColorFromCanvas,
        ]
    );

    const handleUndoLast = useCallback(() => {
        if (isApplying || colorPickerActive) return;

        if (currentStroke) {
            setCurrentStroke(null);
            setIsDrawing(false);
            return;
        }

        if (selectionDraft) {
            setSelectionDraft(null);
            setSelectionStart(null);
            setIsSelecting(false);
            return;
        }

        setDraftActions((prev) => prev.slice(0, -1));
    }, [currentStroke, selectionDraft, isApplying, colorPickerActive]);

    const handleClearDraft = useCallback(() => {
        if (isApplying || colorPickerActive) return;

        setDraftActions([]);
        setCurrentStroke(null);
        setIsDrawing(false);

        setSelectionDraft(null);
        setSelectionStart(null);
        setIsSelecting(false);
    }, [isApplying, colorPickerActive]);

    const handleApply = useCallback(async () => {
        if (isApplying || colorPickerActive) return;

        if (manualTool === "SELECT") {
            if (!selectionDraft || selectionDraft.width <= 0 || selectionDraft.height <= 0) {
                return;
            }

            const sourceCanvas = sourceCanvasRef.current;
            if (!sourceCanvas || !onImageCropApply) {
                return;
            }

            const cropCanvas = document.createElement("canvas");
            cropCanvas.width = selectionDraft.width;
            cropCanvas.height = selectionDraft.height;

            const cropCtx = cropCanvas.getContext("2d");
            cropCtx.drawImage(
                sourceCanvas,
                selectionDraft.x,
                selectionDraft.y,
                selectionDraft.width,
                selectionDraft.height,
                0,
                0,
                selectionDraft.width,
                selectionDraft.height
            );

            cropCanvas.toBlob(async (blob) => {
                if (!blob) return;
                await onImageCropApply(blob);
                setSelectionDraft(null);
                setSelectionStart(null);
                setIsSelecting(false);
            }, "image/png");

            return;
        }

        if (!onManualApplyBatch) return;

        const actionsToApply = [...draftActions];
        if (currentStroke && (currentStroke.points || []).length >= 2) {
            actionsToApply.push(currentStroke);
        }

        if (actionsToApply.length === 0) return;

        try {
            setIsApplying(true);
            await onManualApplyBatch(actionsToApply);
            setDraftActions([]);
            setCurrentStroke(null);
            setIsDrawing(false);
        } finally {
            setIsApplying(false);
        }
    }, [
        manualTool,
        selectionDraft,
        onImageCropApply,
        onManualApplyBatch,
        draftActions,
        currentStroke,
        isApplying,
        colorPickerActive,
    ]);

    if (!imageSrc) return null;

    const selectMode = manualConfig?.mode ?? "RECTANGLE";
    const selectionReady =
        manualTool === "SELECT" &&
        selectionDraft &&
        selectionDraft.width > 0 &&
        selectionDraft.height > 0;

    return (
        <div className="flex flex-col items-center gap-3">
            <div
                className={`relative border-2 rounded shadow-sm ${
                    isManualMode || colorPickerActive ? "border-blue-500" : "border-blue-400"
                }`}
                style={{
                    maxWidth: "100%",
                    overflow: "hidden",
                    backgroundImage: `
            linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
          `,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
            >
                <canvas
                    ref={previewCanvasRef}
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onClick={handleClick}
                    className={`block ${
                        colorPickerActive
                            ? "cursor-crosshair"
                            : isManualMode
                                ? "cursor-crosshair"
                                : "cursor-default"
                    }`}
                    style={{
                        display: "block",
                        maxHeight: "420px",
                        maxWidth: "100%",
                        width: "auto",
                        height: "auto",
                    }}
                />

                <canvas ref={sourceCanvasRef} style={{ display: "none" }} />
            </div>

            {colorPickerActive && (
                <div className="text-sm text-blue-700 font-medium">
                    Color picker is active. Click on the image to choose a color.
                </div>
            )}

            {manualTool === "SELECT" && !colorPickerActive && (
                <div className="text-sm text-gray-700">
                    {selectMode === "FREEHAND"
                        ? "Freehand selection is not implemented yet."
                        : selectionReady
                            ? `Selection: ${Math.round(selectionDraft.width)} × ${Math.round(selectionDraft.height)}`
                            : "Drag on the image to create a rectangular selection."}
                </div>
            )}

            {isManualMode && !colorPickerActive && (
                <div className="flex flex-col items-center gap-2">
                    <div className="text-sm text-gray-600">
                        Draft actions: <b>{draftActions.length + (currentStroke ? 1 : 0)}</b>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleUndoLast}
                            disabled={!hasDraft || isApplying}
                            className={`px-4 py-2 rounded border ${
                                hasDraft && !isApplying
                                    ? "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                                    : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            }`}
                        >
                            Undo Last
                        </button>

                        <button
                            onClick={handleClearDraft}
                            disabled={!hasDraft || isApplying}
                            className={`px-4 py-2 rounded border ${
                                hasDraft && !isApplying
                                    ? "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                                    : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            }`}
                        >
                            Clear Draft
                        </button>

                        <button
                            onClick={handleApply}
                            disabled={
                                manualTool === "SELECT"
                                    ? !selectionReady || isApplying
                                    : !hasDraft || isApplying
                            }
                            className={`px-4 py-2 rounded ${
                                (manualTool === "SELECT" ? selectionReady : hasDraft) && !isApplying
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-blue-200 text-white cursor-not-allowed"
                            }`}
                        >
                            {isApplying ? "Applying..." : manualTool === "SELECT" ? "Crop" : "Apply"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}