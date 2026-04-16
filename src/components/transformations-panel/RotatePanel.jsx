import React, { useState } from "react";
import { FaUndoAlt, FaRedoAlt, FaSyncAlt } from "react-icons/fa";
import { MdRotateLeft, MdRotateRight } from "react-icons/md";
import { HiOutlineInformationCircle } from "react-icons/hi";

export default function RotatePanel() {
    const [angle, setAngle] = useState(0);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>
                    Rotate the image by a specified angle. This is a UI stub (no processing yet).
                </p>
            </div>

            <div className="bg-white border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                        <MdRotateRight />
                        <span>Angle</span>
                    </div>
                    <span className="text-sm text-gray-600">{angle}°</span>
                </div>

                <input
                    type="range"
                    min={-180}
                    max={180}
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full"
                />

                <div className="grid grid-cols-3 gap-2">
                    <button
                        disabled
                        className="py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <FaUndoAlt /> -90°
                    </button>
                    <button
                        disabled
                        className="py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <FaRedoAlt /> +90°
                    </button>
                    <button
                        disabled
                        className="py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <FaSyncAlt /> Reset
                    </button>
                </div>
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 text-blue-900 text-sm flex items-start gap-2">
                <HiOutlineInformationCircle className="mt-0.5" />
                <div>
                    Planned: server-side rotation via OpenCV, with history tracking.
                </div>
            </div>

            <button
                disabled
                className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
            >
                <MdRotateLeft /> Apply Rotation
            </button>
        </div>
    );
}