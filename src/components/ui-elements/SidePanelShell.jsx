import React from "react";

export default function SidePanelShell({ title, children, footer }) {
    return (
        <div className="absolute left-64 top-0 h-full w-[380px] bg-white border-l border-blue-200 shadow-lg z-10 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-blue-200 bg-white">
                <h3 className="text-blue-900 font-semibold">{title}</h3>
            </div>

            <div className="flex-grow overflow-auto">{children}</div>

            {footer ? (
                <div className="p-4 border-t border-blue-200 bg-gray-50">{footer}</div>
            ) : null}
        </div>
    );
}