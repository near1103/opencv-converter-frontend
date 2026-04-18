import React from "react";

export default function BrushPanel({ value, onChange }) {
    const size = value?.size ?? 12;
    const opacity = value?.opacity ?? 0.8;
    const color = value?.color ?? "#000000";

    return (
        <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
                Draw one or more strokes on the image, then click Apply below the preview.
            </p>

            <div className="space-y-2">
                <label className="text-sm text-gray-700">Color</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => onChange({ color: e.target.value })}
                    className="w-full h-10 rounded border"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm text-gray-700">Size: {size}px</label>
                <input
                    type="range"
                    min={1}
                    max={80}
                    value={size}
                    onChange={(e) => onChange({ size: Number(e.target.value) })}
                    className="w-full"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm text-gray-700">
                    Opacity: {Math.round(opacity * 100)}%
                </label>
                <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={opacity}
                    onChange={(e) => onChange({ opacity: Number(e.target.value) })}
                    className="w-full"
                />
            </div>
        </div>
    );
}