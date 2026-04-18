import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";

export default function SelectPanel() {
    return (
        <div className="p-4 space-y-3">
            <div className="flex items-start gap-2 text-gray-700 text-sm">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>
                    Drag on the image to select a rectangular area. Click <b>Crop</b> to apply.
                </p>
            </div>

            <div className="bg-white border rounded-lg p-3">
                <div className="text-sm font-semibold text-blue-900">
                    Rectangle selection
                </div>
            </div>
        </div>
    );
}