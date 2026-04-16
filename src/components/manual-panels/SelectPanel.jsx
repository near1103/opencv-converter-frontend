import React, { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FaRegSquare, FaVectorSquare, FaCheckCircle } from "react-icons/fa";
import { MdOutlineTune } from "react-icons/md";

export default function SelectPanel() {
    const [mode, setMode] = useState("RECTANGLE");
    const [feather, setFeather] = useState(0);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>Select an area of the image for further actions. UI stub (selection on canvas will be added later).</p>
            </div>

            <div className="bg-white border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <FaVectorSquare />
                    <span>Selection mode</span>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="radio"
                            name="sel"
                            checked={mode === "RECTANGLE"}
                            onChange={() => setMode("RECTANGLE")}
                        />
                        <span className="flex items-center gap-2">
              <FaRegSquare /> Rectangle
            </span>
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="radio"
                            name="sel"
                            checked={mode === "FREEHAND"}
                            onChange={() => setMode("FREEHAND")}
                        />
                        <span className="flex items-center gap-2">
              <FaVectorSquare /> Freehand
            </span>
                    </label>
                </div>

                <div className="space-y-2 pt-2">
                    <label className="text-xs text-gray-600 flex items-center gap-2">
                        <MdOutlineTune /> Feather: <b>{feather}px</b>
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={50}
                        value={feather}
                        onChange={(e) => setFeather(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 text-blue-900 text-sm flex items-center gap-2">
                <FaCheckCircle />
                <span>
          Mode <b>{mode}</b> • Feather <b>{feather}px</b>
        </span>
            </div>

            <button
                disabled
                className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
            >
                <FaVectorSquare /> Apply Selection
            </button>
        </div>
    );
}