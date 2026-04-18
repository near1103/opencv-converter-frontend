import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FaUndoAlt } from "react-icons/fa";

export default function UndoPanel({ onUndo, canUndo }) {
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>Undo restores the previous saved image state from local history.</p>
            </div>

            <button
                onClick={onUndo}
                disabled={!canUndo}
                className="w-full px-4 py-3 rounded-lg border bg-white text-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <FaUndoAlt />
                Undo last step
            </button>
        </div>
    );
}