import React, { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { MdFlip, MdSwapVert } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

export default function FlipPanel() {
    const [mode, setMode] = useState("HORIZONTAL");

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>Flip the image horizontally or vertically. This is a UI stub (no processing yet).</p>
            </div>

            <div className="bg-white border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <MdFlip />
                    <span>Flip mode</span>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="radio"
                            name="flip"
                            value="HORIZONTAL"
                            checked={mode === "HORIZONTAL"}
                            onChange={() => setMode("HORIZONTAL")}
                        />
                        <span className="flex items-center gap-2">
              <MdFlip /> Horizontal (mirror left ↔ right)
            </span>
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="radio"
                            name="flip"
                            value="VERTICAL"
                            checked={mode === "VERTICAL"}
                            onChange={() => setMode("VERTICAL")}
                        />
                        <span className="flex items-center gap-2">
              <MdSwapVert /> Vertical (mirror top ↕ bottom)
            </span>
                    </label>
                </div>
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 text-blue-900 text-sm flex items-center gap-2">
                <FaCheckCircle />
                <span>
          Selected: <b>{mode}</b>
        </span>
            </div>

            <button
                disabled
                className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
            >
                <MdFlip /> Apply Flip
            </button>
        </div>
    );
}