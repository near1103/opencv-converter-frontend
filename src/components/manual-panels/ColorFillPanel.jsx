import React from "react";

export default function ColorFillPanel({ value, onChange }) {
    const color = value?.color ?? "#000000";
    const tolerance = value?.tolerance ?? 20;

    return (
        <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
                You can place multiple fill points, then click Apply below the preview.
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
                <label className="text-sm text-gray-700">
                    Tolerance: {tolerance}
                </label>
                <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={tolerance}
                    onChange={(e) => onChange({ tolerance: Number(e.target.value) })}
                    className="w-full"
                />
            </div>
        </div>
    );
}