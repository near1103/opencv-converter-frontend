import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FaUndoAlt } from "react-icons/fa";

export default function UndoPanel() {
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>Undo the last operation. This is a UI stub (will be enabled with history).</p>
            </div>

            <button
                disabled
                className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
            >
                <FaUndoAlt /> Undo last step
            </button>
        </div>
    );
}