import React, { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FaFillDrip, FaCheckCircle } from "react-icons/fa";
import { MdOutlineTune } from "react-icons/md";

export default function ColorFillPanel() {
    const [color, setColor] = useState("#3B82F6");
    const [tolerance, setTolerance] = useState(20);
    const [mode, setMode] = useState("FLOOD"); // FLOOD or GLOBAL
    const [preserveEdges, setPreserveEdges] = useState(true);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>
                    Fill an area with a selected color. UI stub (bucket tool / flood-fill will be added later).
                </p>
            </div>

            <div className="bg-white border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <FaFillDrip />
                    <span>Fill settings</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-600">Fill color</div>
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

                <div className="space-y-2">
                    <div className="text-xs text-gray-600 flex items-center gap-2">
                        <MdOutlineTune /> Tolerance: <b>{tolerance}</b>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={tolerance}
                        onChange={(e) => setTolerance(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="space-y-2 pt-1">
                    <div className="text-xs text-gray-600">Fill mode</div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="radio"
                            name="fillmode"
                            checked={mode === "FLOOD"}
                            onChange={() => setMode("FLOOD")}
                        />
                        Bucket (flood fill from clicked pixel)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="radio"
                            name="fillmode"
                            checked={mode === "GLOBAL"}
                            onChange={() => setMode("GLOBAL")}
                        />
                        Replace all similar colors in the image
                    </label>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 pt-1">
                    <input
                        type="checkbox"
                        checked={preserveEdges}
                        onChange={(e) => setPreserveEdges(e.target.checked)}
                    />
                    Preserve edges (planned)
                </label>
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 text-blue-900 text-sm flex items-center gap-2">
                <FaCheckCircle />
                <span>
          Color <b>{color}</b> • Tolerance <b>{tolerance}</b> • Mode <b>{mode}</b>
        </span>
            </div>

            <button
                disabled
                className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
            >
                <FaFillDrip /> Apply Color Fill
            </button>
        </div>
    );
}