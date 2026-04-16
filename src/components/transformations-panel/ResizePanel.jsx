import React, { useEffect, useMemo, useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { MdPhotoSizeSelectLarge, MdOutlineTune, MdLock, MdLockOpen } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

export default function ResizePanel({ imageSrc, applyTransformation }) {
    const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [scalePercent, setScalePercent] = useState(100);
    const [keepAspect, setKeepAspect] = useState(true);
    const [method, setMethod] = useState("BILINEAR");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!imageSrc) return;

        const img = new Image();
        img.onload = () => {
            const nextWidth = img.naturalWidth || img.width;
            const nextHeight = img.naturalHeight || img.height;

            setOriginalSize({ width: nextWidth, height: nextHeight });
            setWidth(nextWidth);
            setHeight(nextHeight);
            setScalePercent(100);
        };
        img.src = imageSrc;
    }, [imageSrc]);

    const aspectRatio = useMemo(() => {
        if (!originalSize.width || !originalSize.height) return 1;
        return originalSize.width / originalSize.height;
    }, [originalSize]);

    const applyPreset = (presetWidth, presetHeight) => {
        setWidth(presetWidth);
        setHeight(presetHeight);

        if (originalSize.width > 0) {
            setScalePercent(Math.round((presetWidth / originalSize.width) * 100));
        }
    };

    const handleScaleChange = (value) => {
        const percent = Number(value);
        setScalePercent(percent);

        if (!originalSize.width || !originalSize.height) return;

        const nextWidth = Math.max(1, Math.round((originalSize.width * percent) / 100));
        const nextHeight = Math.max(1, Math.round((originalSize.height * percent) / 100));

        setWidth(nextWidth);
        setHeight(nextHeight);
    };

    const handleWidthChange = (value) => {
        const nextWidth = Math.max(1, Number(value) || 1);
        setWidth(nextWidth);

        if (keepAspect && aspectRatio) {
            setHeight(Math.max(1, Math.round(nextWidth / aspectRatio)));
        }

        if (originalSize.width > 0) {
            setScalePercent(Math.round((nextWidth / originalSize.width) * 100));
        }
    };

    const handleHeightChange = (value) => {
        const nextHeight = Math.max(1, Number(value) || 1);
        setHeight(nextHeight);

        if (keepAspect && aspectRatio) {
            setWidth(Math.max(1, Math.round(nextHeight * aspectRatio)));
        }

        if (originalSize.height > 0) {
            setScalePercent(Math.round((nextHeight / originalSize.height) * 100));
        }
    };

    const handleApply = async () => {
        if (!width || !height || width <= 0 || height <= 0) {
            alert("Width and height must be greater than 0.");
            return;
        }

        try {
            setLoading(true);

            await applyTransformation("RESIZE", {
                width: String(width),
                height: String(height),
                keepAspect: String(keepAspect),
                method,
            });
        } finally {
            setLoading(false);
        }
    };

    const presets = [
        { label: "Original", width: originalSize.width, height: originalSize.height },
        { label: "1080p", width: 1920, height: 1080 },
        { label: "Square", width: 1080, height: 1080 },
        { label: "1024", width: 1024, height: 1024 },
        { label: "800×600", width: 800, height: 600 },
    ];

    return (
        <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <HiOutlineInformationCircle className="text-lg mt-0.5 shrink-0" />
                <p>
                    Resize using presets, a scale slider, or manual dimensions. Final width and height will still be sent to the backend.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                    Quick presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {presets.map((preset) => (
                        <button
                            key={preset.label}
                            type="button"
                            disabled={!preset.width || !preset.height}
                            onClick={() => applyPreset(preset.width, preset.height)}
                            className="px-3 py-2 rounded-lg border border-blue-200 text-blue-800 hover:bg-blue-50 disabled:bg-slate-100 disabled:text-slate-400 transition text-sm"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-blue-900">
                        Scale
                    </label>
                    <span className="text-sm font-semibold text-blue-900">
            {scalePercent}%
          </span>
                </div>

                <input
                    type="range"
                    min={10}
                    max={200}
                    step={1}
                    value={scalePercent}
                    onChange={(e) => handleScaleChange(e.target.value)}
                    className="w-full"
                />
            </div>

            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-blue-900">
                    Dimensions
                </label>

                <button
                    type="button"
                    onClick={() => setKeepAspect((prev) => !prev)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition ${
                        keepAspect
                            ? "border-blue-500 bg-blue-50 text-blue-900"
                            : "border-blue-200 text-blue-800 hover:bg-blue-50"
                    }`}
                >
                    {keepAspect ? <MdLock /> : <MdLockOpen />}
                    {keepAspect ? "Aspect locked" : "Aspect unlocked"}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-blue-900 mb-1">Width (px)</label>
                    <input
                        type="number"
                        min={1}
                        value={width}
                        onChange={(e) => handleWidthChange(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm text-blue-900 mb-1">Height (px)</label>
                    <input
                        type="number"
                        min={1}
                        value={height}
                        onChange={(e) => handleHeightChange(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                    Interpolation
                </label>

                <div className="relative">
                    <MdOutlineTune className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="w-full border border-blue-200 rounded px-10 py-2 text-sm"
                    >
                        <option value="NEAREST">Nearest</option>
                        <option value="BILINEAR">Bilinear</option>
                        <option value="BICUBIC">Bicubic</option>
                        <option value="LANCZOS">Lanczos</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-blue-900 bg-blue-50 rounded-lg px-3 py-2">
                <MdPhotoSizeSelectLarge className="text-blue-600 shrink-0" />
                <span>
          Target: {width} × {height}
                    {originalSize.width > 0 && originalSize.height > 0
                        ? ` • Original: ${originalSize.width} × ${originalSize.height}`
                        : ""}
        </span>
                <FaCheckCircle className="text-green-600 ml-auto" />
            </div>

            <button
                type="button"
                onClick={handleApply}
                disabled={loading || !imageSrc}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition"
            >
                {loading ? "Applying..." : "Apply Resize"}
            </button>
        </div>
    );
}