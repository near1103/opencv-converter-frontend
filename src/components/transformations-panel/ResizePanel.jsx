import React, { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { MdPhotoSizeSelectLarge, MdOutlineTune } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

export default function ResizePanel() {
    const [keepAspect, setKeepAspect] = useState(true);
    const [width, setWidth] = useState(1024);
    const [height, setHeight] = useState(1024);
    const [method, setMethod] = useState("BILINEAR");

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>Resize the image to a target resolution. This is a UI stub (no processing yet).</p>
            </div>

            <div className="bg-white border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                        <MdPhotoSizeSelectLarge />
                        <span>Dimensions</span>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={keepAspect}
                            onChange={(e) => setKeepAspect(e.target.checked)}
                        />
                        Keep aspect ratio
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-600">Width (px)</label>
                        <input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            className="w-full border rounded px-2 py-1 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600">Height (px)</label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full border rounded px-2 py-1 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <MdOutlineTune />
                        <span>Interpolation</span>
                    </div>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                    >
                        <option value="NEAREST">Nearest</option>
                        <option value="BILINEAR">Bilinear</option>
                        <option value="BICUBIC">Bicubic</option>
                        <option value="LANCZOS">Lanczos</option>
                    </select>
                </div>
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 text-blue-900 text-sm flex items-center gap-2">
                <FaCheckCircle />
                <span>
          Target: <b>{width}×{height}</b> • Method: <b>{method}</b>
        </span>
            </div>

            <button
                disabled
                className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
            >
                <MdPhotoSizeSelectLarge /> Apply Resize
            </button>
        </div>
    );
}