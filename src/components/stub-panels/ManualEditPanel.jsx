import React from "react";

export default function ManualEditPanel() {
    return (
        <div className="p-4 space-y-3">
            <p className="text-gray-700">
                Розділ <b>Manual Editing</b> буде реалізовано пізніше. Тут плануються інструменти:
            </p>

            <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Пензель/ластик</li>
                <li>Виділення області</li>
                <li>Накладання простих фігур</li>
            </ul>

            <div className="mt-4 p-3 rounded border bg-blue-50 text-blue-900 text-sm">
                Заглушка UI: панель під інструменти ручного редагування.
            </div>

            <div className="space-y-2 pt-2">
                <button className="w-full py-2 bg-gray-200 text-gray-600 rounded cursor-not-allowed" disabled>
                    Apply Manual Edit
                </button>
                <button className="w-full py-2 bg-gray-200 text-gray-600 rounded cursor-not-allowed" disabled>
                    Reset
                </button>
            </div>
        </div>
    );
}