import React, { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FaEraser, FaCheckCircle } from "react-icons/fa";
import { MdOutlineTune } from "react-icons/md";

export default function EraserPanel() {
    const [size, setSize] = useState(18);
    const [softness, setSoftness] = useState(0.3);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>Erase parts of the image. UI stub (no canvas editing yet).</p>
            </div>

            <div className="bg-white border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <FaEraser />
                    <span>Eraser settings</span>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-600 flex items-center gap-2">
                        <MdOutlineTune /> Size: <b>{size}px</b>
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={100}
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-600 flex items-center gap-2">
                        <MdOutlineTune /> Softness: <b>{Math.round(softness * 100)}%</b>
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={softness}
                        onChange={(e) => setSoftness(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 text-blue-900 text-sm flex items-center gap-2">
                <FaCheckCircle />
                <span>
          Size <b>{size}px</b> • Softness <b>{Math.round(softness * 100)}%</b>
        </span>
            </div>

            <button
                disabled
                className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
            >
                <FaEraser /> Apply Eraser
            </button>
        </div>
    );
}