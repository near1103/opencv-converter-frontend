import React, { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FaPaintBrush, FaCheckCircle } from "react-icons/fa";
import { MdOutlineTune } from "react-icons/md";

export default function BrushPanel() {
    const [size, setSize] = useState(12);
    const [opacity, setOpacity] = useState(0.7);
    const [color, setColor] = useState("#3B82F6");

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>Draw on the image using a brush tool. UI stub (no canvas editing yet).</p>
            </div>

            <div className="bg-white border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <FaPaintBrush />
                    <span>Brush settings</span>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-600 flex items-center gap-2">
                        <MdOutlineTune /> Size: <b>{size}px</b>
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={80}
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-600 flex items-center gap-2">
                        <MdOutlineTune /> Opacity: <b>{Math.round(opacity * 100)}%</b>
                    </label>
                    <input
                        type="range"
                        min={0.05}
                        max={1}
                        step={0.05}
                        value={opacity}
                        onChange={(e) => setOpacity(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-600">Color</div>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-9 w-12 border rounded"
                        />
                        <span className="text-xs text-gray-600">{color}</span>
                    </div>
                </div>
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 text-blue-900 text-sm flex items-center gap-2">
                <FaCheckCircle />
                <span>
          Size <b>{size}px</b> • Opacity <b>{Math.round(opacity * 100)}%</b> • Color{" "}
                    <b>{color}</b>
        </span>
            </div>

            <button
                disabled
                className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
            >
                <FaPaintBrush /> Apply Brush
            </button>
        </div>
    );
}