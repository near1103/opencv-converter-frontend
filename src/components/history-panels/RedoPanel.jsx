import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FaRedoAlt } from "react-icons/fa";

export default function RedoPanel({ onRedo, canRedo }) {
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>Redo restores the next image state that was previously undone.</p>
            </div>

            <button
                onClick={onRedo}
                disabled={!canRedo}
                className="w-full px-4 py-3 rounded-lg border bg-white text-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <FaRedoAlt />
                Redo step
            </button>
        </div>
    );
}