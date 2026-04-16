import React, { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { MdCrop, MdOutlineAspectRatio } from "react-icons/md";
import { FaRegSquare, FaCheckCircle } from "react-icons/fa";

export default function CropPanel() {
    const [preset, setPreset] = useState("FREE");
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [w, setW] = useState(512);
    const [h, setH] = useState(512);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>
                    Crop a region of the image. This is a UI stub (canvas selection will be added later).
                </p>
            </div>

            <div className="bg-white border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <MdOutlineAspectRatio />
                    <span>Aspect ratio</span>
                </div>

                <select
                    value={preset}
                    onChange={(e) => setPreset(e.target.value)}
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                >
                    <option value="FREE">Free</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:3">4:3</option>
                    <option value="16:9">16:9</option>
                </select>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                        <label className="text-xs text-gray-600">X</label>
                        <input
                            type="number"
                            value={x}
                            onChange={(e) => setX(Number(e.target.value))}
                            className="w-full border rounded px-2 py-1 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600">Y</label>
                        <input
                            type="number"
                            value={y}
                            onChange={(e) => setY(Number(e.target.value))}
                            className="w-full border rounded px-2 py-1 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600">Width</label>
                        <input
                            type="number"
                            value={w}
                            onChange={(e) => setW(Number(e.target.value))}
                            className="w-full border rounded px-2 py-1 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600">Height</label>
                        <input
                            type="number"
                            value={h}
                            onChange={(e) => setH(Number(e.target.value))}
                            className="w-full border rounded px-2 py-1 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 text-blue-900 text-sm flex items-center gap-2">
                <FaCheckCircle />
                <span>
          Crop rect: <b>({x}, {y})</b> • <b>{w}×{h}</b> • Ratio: <b>{preset}</b>
        </span>
            </div>

            <button
                disabled
                className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
            >
                <MdCrop /> Apply Crop
            </button>
        </div>
    );
}