import React from "react";
import { useGlobalLoading } from "../../loading/LoadingContext";

export default function LoadingOverlay() {
    const { isLoading, message } = useGlobalLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
            <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 min-w-[260px] max-w-[90vw] text-center">
                <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin" />
                <p className="text-sm font-medium text-gray-800">{message}</p>
                <p className="text-xs text-gray-500 mt-2">Please wait…</p>
            </div>
        </div>
    );
}