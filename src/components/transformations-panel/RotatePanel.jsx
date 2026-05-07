import React, { useState } from "react";
import { FaUndoAlt, FaRedoAlt, FaSyncAlt } from "react-icons/fa";
import { MdRotateLeft, MdRotateRight } from "react-icons/md";
import { HiOutlineInformationCircle } from "react-icons/hi";

export default function RotatePanel({ applyTransformation }) {
    const [angle, setAngle] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        try {
            setLoading(true);
            await applyTransformation("ROTATE", {
                angle: String(angle),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <HiOutlineInformationCircle className="text-lg mt-0.5 shrink-0" />
                <p>Rotate the image by a specified angle.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                    Angle
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min={-180}
                        max={180}
                        step={1}
                        value={angle}
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className="w-full"
                    />
                    <span className="text-sm font-semibold text-blue-900 min-w-[60px] text-right">
            {angle}°
          </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => setAngle((prev) => prev - 90)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-800 hover:bg-blue-50 transition"
                >
                    <MdRotateLeft />
                    -90°
                </button>

                <button
                    type="button"
                    onClick={() => setAngle((prev) => prev + 90)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-800 hover:bg-blue-50 transition"
                >
                    <MdRotateRight />
                    +90°
                </button>

                <button
                    type="button"
                    onClick={() => setAngle(0)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-800 hover:bg-blue-50 transition"
                >
                    <FaSyncAlt />
                    Reset
                </button>
            </div>

            <button
                type="button"
                onClick={handleApply}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition"
            >
                {loading ? "Applying..." : "Apply Rotation"}
            </button>
        </div>
    );
}