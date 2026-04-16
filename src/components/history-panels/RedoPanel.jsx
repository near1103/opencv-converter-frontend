import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FaRedoAlt } from "react-icons/fa";

export default function RedoPanel() {
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>Redo the previously undone operation. This is a UI stub.</p>
            </div>

            <button
                disabled
                className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
            >
                <FaRedoAlt /> Redo step
            </button>
        </div>
    );
}