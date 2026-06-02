import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactCrop, {
    centerCrop,
    convertToPixelCrop,
    makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import NeutralSlider from "../ui-elements/NeutralSlider";
import { createObamifyTempPreset, fetchObamifyPresets } from "../../api";

const PRESETS_PER_PAGE = 4;

function createCenteredSquareCrop(mediaWidth, mediaHeight, widthPercent = 75) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: widthPercent,
            },
            1,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

async function canvasToFile(canvas, fileName = "obamify-preset.png") {
    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error("Failed to create image blob"));
                }
            },
            "image/png",
            1
        );
    });

    return new File([blob], fileName, {
        type: "image/png",
    });
}

async function createCroppedSquareCanvas(image, percentCrop) {
    if (!image || !percentCrop?.width || !percentCrop?.height) {
        throw new Error("Crop area is not selected");
    }

    const pixelCrop = convertToPixelCrop(
        percentCrop,
        image.naturalWidth,
        image.naturalHeight
    );

    const sourceSize = Math.round(Math.min(pixelCrop.width, pixelCrop.height));

    const canvas = document.createElement("canvas");
    canvas.width = sourceSize;
    canvas.height = sourceSize;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Failed to create canvas context");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
        image,
        Math.round(pixelCrop.x),
        Math.round(pixelCrop.y),
        sourceSize,
        sourceSize,
        0,
        0,
        sourceSize,
        sourceSize
    );

    return canvas;
}

function createPreviewUrlFromCanvas(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Failed to create preview"));
                return;
            }

            resolve(URL.createObjectURL(blob));
        }, "image/png");
    });
}

function PriorityBrushMask({
                               imageSrc,
                               size = 256,
                               defaultBrushSize = 24,
                               onMaskReady,
                           }) {
    const visibleCanvasRef = useRef(null);
    const maskCanvasRef = useRef(null);
    const imageRef = useRef(null);
    const drawingRef = useRef(false);

    const [brushSize, setBrushSize] = useState(defaultBrushSize);
    const [hasMask, setHasMask] = useState(false);

    useEffect(() => {
        if (!imageSrc) {
            return;
        }

        const img = new Image();

        img.onload = () => {
            imageRef.current = img;

            const visibleCanvas = visibleCanvasRef.current;
            const maskCanvas = maskCanvasRef.current;

            if (!visibleCanvas || !maskCanvas) {
                return;
            }

            visibleCanvas.width = size;
            visibleCanvas.height = size;
            maskCanvas.width = size;
            maskCanvas.height = size;

            const visibleCtx = visibleCanvas.getContext("2d");
            const maskCtx = maskCanvas.getContext("2d");

            visibleCtx.clearRect(0, 0, size, size);
            visibleCtx.drawImage(img, 0, 0, size, size);

            maskCtx.fillStyle = "black";
            maskCtx.fillRect(0, 0, size, size);

            setHasMask(false);
            onMaskReady?.(null);
        };

        img.src = imageSrc;
    }, [imageSrc, size]);

    const getCanvasPoint = (event) => {
        const canvas = visibleCanvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const clientX = event.touches?.[0]?.clientX ?? event.clientX;
        const clientY = event.touches?.[0]?.clientY ?? event.clientY;

        return {
            x: ((clientX - rect.left) / rect.width) * size,
            y: ((clientY - rect.top) / rect.height) * size,
        };
    };

    const exportMask = () => {
        const maskCanvas = maskCanvasRef.current;

        if (!maskCanvas) {
            onMaskReady?.(null);
            return;
        }

        maskCanvas.toBlob((blob) => {
            if (!blob) {
                onMaskReady?.(null);
                return;
            }

            onMaskReady?.(
                new File([blob], "priority-mask.png", {
                    type: "image/png",
                })
            );
        }, "image/png");
    };

    const drawPoint = (event) => {
        if (!drawingRef.current) {
            return;
        }

        event.preventDefault();

        const visibleCanvas = visibleCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;

        if (!visibleCanvas || !maskCanvas) {
            return;
        }

        const visibleCtx = visibleCanvas.getContext("2d");
        const maskCtx = maskCanvas.getContext("2d");

        const { x, y } = getCanvasPoint(event);

        visibleCtx.save();
        visibleCtx.globalAlpha = 0.45;
        visibleCtx.fillStyle = "red";
        visibleCtx.beginPath();
        visibleCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        visibleCtx.fill();
        visibleCtx.restore();

        maskCtx.fillStyle = "white";
        maskCtx.beginPath();
        maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        maskCtx.fill();

        setHasMask(true);
    };

    const startDrawing = (event) => {
        drawingRef.current = true;
        drawPoint(event);
    };

    const stopDrawing = () => {
        if (!drawingRef.current) {
            return;
        }

        drawingRef.current = false;
        exportMask();
    };

    const clearMask = () => {
        const visibleCanvas = visibleCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        const image = imageRef.current;

        if (!visibleCanvas || !maskCanvas || !image) {
            return;
        }

        const visibleCtx = visibleCanvas.getContext("2d");
        const maskCtx = maskCanvas.getContext("2d");

        visibleCtx.clearRect(0, 0, size, size);
        visibleCtx.drawImage(image, 0, 0, size, size);

        maskCtx.fillStyle = "black";
        maskCtx.fillRect(0, 0, size, size);

        setHasMask(false);
        onMaskReady?.(null);
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
                    Brush size: {brushSize}px
                </label>

                <input
                    type="range"
                    min="6"
                    max="80"
                    step="1"
                    value={brushSize}
                    onChange={(event) => setBrushSize(Number(event.target.value))}
                    className="w-full"
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={clearMask}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                    Clear mask
                </button>

                <div
                    className={[
                        "flex-1 rounded-lg px-3 py-2 text-sm text-center border",
                        hasMask
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-500",
                    ].join(" ")}
                >
                    {hasMask ? "Mask ready" : "Draw area"}
                </div>
            </div>
        </div>
    );
}

export default function ObamifyPanel({ params, setParams }) {
    const [presets, setPresets] = useState([]);
    const [presetPage, setPresetPage] = useState(0);
    const [loadingPresets, setLoadingPresets] = useState(false);

    const [presetImageSrc, setPresetImageSrc] = useState("");
    const [presetImageName, setPresetImageName] = useState("");
    const [presetCrop, setPresetCrop] = useState();
    const [completedPresetCrop, setCompletedPresetCrop] = useState(null);
    const [presetImgRef, setPresetImgRef] = useState(null);

    const [squarePreviewSrc, setSquarePreviewSrc] = useState("");
    const [squarePreviewCanvas, setSquarePreviewCanvas] = useState(null);

    const [presetMode, setPresetMode] = useState("object_text");
    const [presetPriority, setPresetPriority] = useState("all");
    const [priorityMaskFile, setPriorityMaskFile] = useState(null);

    const [creatingPreview, setCreatingPreview] = useState(false);
    const [creatingPreset, setCreatingPreset] = useState(false);
    const [createPresetError, setCreatePresetError] = useState("");

    const fileInputRef = useRef(null);

    const selectedPreset = params.preset || "obama";

    const updateParam = (key, value) => {
        setParams({
            ...params,
            [key]: value,
        });
    };

    useEffect(() => {
        let cancelled = false;

        async function loadPresets() {
            setLoadingPresets(true);

            try {
                const data = await fetchObamifyPresets();

                if (cancelled) {
                    return;
                }

                setPresets(data);

                const hasSelectedPreset = data.some(
                    (preset) => preset.value === selectedPreset
                );

                if (!hasSelectedPreset && data.length > 0) {
                    updateParam("preset", data[0].value);
                }
            } finally {
                if (!cancelled) {
                    setLoadingPresets(false);
                }
            }
        }

        loadPresets();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        setPresetPage(0);
    }, [presets.length]);

    useEffect(() => {
        return () => {
            if (presetImageSrc) {
                URL.revokeObjectURL(presetImageSrc);
            }

            if (squarePreviewSrc) {
                URL.revokeObjectURL(squarePreviewSrc);
            }
        };
    }, [presetImageSrc, squarePreviewSrc]);

    const totalPages = Math.max(
        1,
        Math.ceil(presets.length / PRESETS_PER_PAGE)
    );

    const visiblePresets = useMemo(() => {
        const start = presetPage * PRESETS_PER_PAGE;
        return presets.slice(start, start + PRESETS_PER_PAGE);
    }, [presets, presetPage]);

    const handlePresetFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (presetImageSrc) {
            URL.revokeObjectURL(presetImageSrc);
        }

        if (squarePreviewSrc) {
            URL.revokeObjectURL(squarePreviewSrc);
        }

        setCreatePresetError("");
        setPresetImageName(file.name);
        setPresetImageSrc(URL.createObjectURL(file));

        setPresetCrop(undefined);
        setCompletedPresetCrop(null);
        setPresetImgRef(null);

        setSquarePreviewSrc("");
        setSquarePreviewCanvas(null);

        setPriorityMaskFile(null);

        event.target.value = "";
    };

    const handlePresetImageLoad = (event) => {
        const image = event.currentTarget;

        setPresetImgRef(image);

        const crop = createCenteredSquareCrop(
            image.width,
            image.height,
            75
        );

        setPresetCrop(crop);
        setCompletedPresetCrop(crop);
    };

    const handleResetPresetCrop = () => {
        if (!presetImgRef) {
            return;
        }

        const crop = createCenteredSquareCrop(
            presetImgRef.width,
            presetImgRef.height,
            75
        );

        setPresetCrop(crop);
        setCompletedPresetCrop(crop);

        if (squarePreviewSrc) {
            URL.revokeObjectURL(squarePreviewSrc);
        }

        setSquarePreviewSrc("");
        setSquarePreviewCanvas(null);
        setPriorityMaskFile(null);
    };

    const handleBuildSquarePreview = async () => {
        if (!presetImgRef || !completedPresetCrop?.width || !completedPresetCrop?.height) {
            setCreatePresetError("Select a square crop area first.");
            return;
        }

        try {
            setCreatingPreview(true);
            setCreatePresetError("");

            const canvas = await createCroppedSquareCanvas(
                presetImgRef,
                completedPresetCrop
            );

            const previewUrl = await createPreviewUrlFromCanvas(canvas);

            if (squarePreviewSrc) {
                URL.revokeObjectURL(squarePreviewSrc);
            }

            setSquarePreviewCanvas(canvas);
            setSquarePreviewSrc(previewUrl);
            setPriorityMaskFile(null);
        } catch (error) {
            setCreatePresetError(
                error?.message || "Failed to create square preset preview"
            );
        } finally {
            setCreatingPreview(false);
        }
    };

    const handleCreatePreset = async () => {
        if (!squarePreviewCanvas) {
            setCreatePresetError("Create square preview first.");
            return;
        }

        if (presetPriority === "mask" && !priorityMaskFile) {
            setCreatePresetError("Draw priority area with brush first.");
            return;
        }

        try {
            setCreatingPreset(true);
            setCreatePresetError("");

            const croppedFile = await canvasToFile(
                squarePreviewCanvas,
                presetImageName || "obamify-preset.png"
            );

            const createdPreset = await createObamifyTempPreset({
                file: croppedFile,
                mode: presetMode,
                priority: presetPriority,
                priorityMask: presetPriority === "mask" ? priorityMaskFile : null,
            });

            const presetValue = createdPreset.preset;

            setPresets((prev) => [
                {
                    value: presetValue,
                    label: createdPreset.label || "Temporary preset",
                    description:
                        createdPreset.description ||
                        `Generated preset (${presetMode}, ${presetPriority})`,
                },
                ...prev,
            ]);

            updateParam("preset", presetValue);
            setPresetPage(0);
        } catch (error) {
            setCreatePresetError(
                error?.message || "Failed to create temporary preset"
            );
        } finally {
            setCreatingPreset(false);
        }
    };

    return (
        <div className="space-y-4 px-4 py-3">
            <div>
                <h3 className="text-lg font-semibold text-blue-900">
                    Obamify Settings
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    This filter transforms the uploaded image into an animated GIF
                    by rearranging image pixels toward the selected target preset.
                </p>

                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Lower proximity importance makes the result closer to the target image.
                    Higher values preserve more of the original image structure.
                </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 space-y-3">
                <div>
                    <h4 className="text-sm font-semibold text-blue-900">
                        Create temporary preset
                    </h4>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        Upload a target image, crop it to 1:1, then optionally paint
                        the important area for the generated weights.
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePresetFileChange}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50 transition"
                >
                    {presetImageSrc ? "Change preset image" : "Upload preset image"}
                </button>

                {presetImageSrc && (
                    <div className="rounded-lg border border-blue-100 bg-slate-100 p-2 space-y-2">
                        <div className="text-xs font-medium text-gray-700">
                            Step 1: square crop for preset image
                        </div>

                        <div className="flex items-center justify-center min-h-[220px] bg-slate-200 rounded-md overflow-hidden">
                            <ReactCrop
                                crop={presetCrop}
                                onChange={(_, percentCrop) => {
                                    setPresetCrop(percentCrop);
                                }}
                                onComplete={(_, percentCrop) => {
                                    setCompletedPresetCrop(percentCrop);
                                }}
                                aspect={1}
                                minWidth={40}
                                minHeight={40}
                                keepSelection
                            >
                                <img
                                    src={presetImageSrc}
                                    alt="Preset crop preview"
                                    onLoad={handlePresetImageLoad}
                                    className="max-h-[300px] w-auto object-contain"
                                />
                            </ReactCrop>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleResetPresetCrop}
                                disabled={!presetImgRef || creatingPreview || creatingPreset}
                                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            >
                                Reset crop
                            </button>

                            <button
                                type="button"
                                onClick={handleBuildSquarePreview}
                                disabled={
                                    creatingPreview ||
                                    creatingPreset ||
                                    !presetImgRef ||
                                    !completedPresetCrop?.width ||
                                    !completedPresetCrop?.height
                                }
                                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {creatingPreview ? "Preparing..." : "Use this crop"}
                            </button>
                        </div>
                    </div>
                )}

                {squarePreviewSrc && (
                    <div className="rounded-lg border border-blue-100 bg-slate-100 p-2 space-y-3">
                        <div className="text-xs font-medium text-gray-700">
                            Step 2: priority area for weights
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Priority
                            </label>

                            <select
                                value={presetPriority}
                                onChange={(event) => {
                                    setPresetPriority(event.target.value);
                                    setPriorityMaskFile(null);
                                }}
                                className="w-full rounded border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700"
                            >
                                <option value="all">Use whole square crop</option>
                                <option value="mask">Use brush mask</option>
                                <option value="none">Auto only</option>
                            </select>
                        </div>

                        {presetPriority === "mask" ? (
                            <PriorityBrushMask
                                imageSrc={squarePreviewSrc}
                                size={256}
                                defaultBrushSize={24}
                                onMaskReady={setPriorityMaskFile}
                            />
                        ) : (
                            <div className="flex items-center justify-center bg-slate-200 rounded-md overflow-hidden p-2">
                                <img
                                    src={squarePreviewSrc}
                                    alt="Square preset preview"
                                    className="max-h-[300px] w-auto object-contain"
                                />
                            </div>
                        )}

                        <div className="text-xs text-gray-500">
                            {presetPriority === "mask"
                                ? "Paint the important area. White mask pixels will be boosted in weights."
                                : presetPriority === "all"
                                    ? "The whole square crop will be boosted in weights."
                                    : "Backend will use only automatic object/text detection."}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Preset mode
                    </label>

                    <select
                        value={presetMode}
                        onChange={(event) => setPresetMode(event.target.value)}
                        className="w-full rounded border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700"
                    >
                        <option value="full">Full image</option>
                        <option value="object">Object / person</option>
                        <option value="object_text">Object + text</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={handleCreatePreset}
                    disabled={creatingPreset || !squarePreviewCanvas}
                    className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {creatingPreset ? "Creating preset..." : "Create preset"}
                </button>

                {createPresetError && (
                    <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {createPresetError}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                        Preset
                    </label>

                    {totalPages > 1 && (
                        <span className="text-xs text-gray-400">
                            {presetPage + 1} / {totalPages}
                        </span>
                    )}
                </div>

                {loadingPresets && (
                    <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        Loading presets...
                    </div>
                )}

                {!loadingPresets && visiblePresets.length === 0 && (
                    <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        No obamify presets found.
                    </div>
                )}

                {!loadingPresets && visiblePresets.length > 0 && (
                    <div className="grid grid-cols-1 gap-2">
                        {visiblePresets.map((preset) => {
                            const active = selectedPreset === preset.value;

                            return (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => updateParam("preset", preset.value)}
                                    className={[
                                        "text-left rounded border px-3 py-2 transition",
                                        active
                                            ? "border-blue-500 bg-blue-50 text-blue-900"
                                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                                    ].join(" ")}
                                >
                                    <div className="text-sm font-medium">
                                        {preset.label || preset.value}
                                    </div>

                                    {preset.description && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {preset.description}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={presetPage === 0}
                            onClick={() =>
                                setPresetPage((prev) => Math.max(0, prev - 1))
                            }
                            className="flex-1 py-1.5 rounded bg-gray-100 text-sm text-gray-700 disabled:opacity-40 hover:bg-gray-200"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            disabled={presetPage >= totalPages - 1}
                            onClick={() =>
                                setPresetPage((prev) =>
                                    Math.min(totalPages - 1, prev + 1)
                                )
                            }
                            className="flex-1 py-1.5 rounded bg-gray-100 text-sm text-gray-700 disabled:opacity-40 hover:bg-gray-200"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            <NeutralSlider
                label="Resolution"
                value={params.resolution ?? 96}
                onChange={(val) => updateParam("resolution", val)}
                min={32}
                max={192}
                step={1}
            />

            <NeutralSlider
                label="Proximity Importance"
                value={params.proximityImportance ?? 4}
                onChange={(val) => updateParam("proximityImportance", val)}
                min={1}
                max={30}
                step={1}
            />

            <div className="rounded bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800 leading-relaxed">
                This filter may take longer than normal filters because it generates
                a full animated GIF.
            </div>
        </div>
    );
}