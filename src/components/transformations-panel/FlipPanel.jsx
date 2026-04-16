import React, { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { MdFlip, MdSwapVert } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

export default function FlipPanel({ applyTransformation }) {
    const [mode, setMode] = useState("HORIZONTAL");
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        try {
            setLoading(true);
            await applyTransformation("FLIP", { mode });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <HiOutlineInformationCircle className="text-lg mt-0.5 shrink-0" />
                <p>Flip the image horizontally or vertically.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                    Flip mode
                </label>

                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => setMode("HORIZONTAL")}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition ${
                            mode === "HORIZONTAL"
                                ? "border-blue-500 bg-blue-50 text-blue-900"
                                : "border-blue-200 hover:bg-blue-50 text-blue-800"
                        }`}
                    >
            <span className="flex items-center gap-2">
              <MdFlip />
              Horizontal (mirror left ↔ right)
            </span>
                        {mode === "HORIZONTAL" && <FaCheckCircle className="text-blue-600" />}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode("VERTICAL")}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition ${
                            mode === "VERTICAL"
                                ? "border-blue-500 bg-blue-50 text-blue-900"
                                : "border-blue-200 hover:bg-blue-50 text-blue-800"
                        }`}
                    >
            <span className="flex items-center gap-2">
              <MdSwapVert />
              Vertical (mirror top ↕ bottom)
            </span>
                        {mode === "VERTICAL" && <FaCheckCircle className="text-blue-600" />}
                    </button>
                </div>
            </div>

            <div className="text-sm text-blue-900 font-medium">
                Selected: {mode}
            </div>

            <button
                type="button"
                onClick={handleApply}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition"
            >
                {loading ? "Applying..." : "Apply Flip"}
            </button>
        </div>
    );
}