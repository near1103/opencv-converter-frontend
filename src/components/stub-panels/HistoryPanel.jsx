import React from "react";

export default function HistoryPanel() {
    // Заглушка: пізніше тут буде реальний список з Firestore
    const items = [];

    return (
        <div className="p-4 space-y-3">
            <p className="text-gray-700">
                Розділ <b>History</b> відображатиме історію змін (інструмент + параметри + час).
            </p>

            <div className="border rounded bg-white">
                <div className="px-3 py-2 border-b text-sm font-semibold text-blue-900">
                    History items
                </div>

                {items.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-gray-600">
                        Поки що історія порожня (заглушка).
                    </div>
                ) : (
                    <ul className="divide-y">
                        {items.map((x) => (
                            <li key={x.id} className="px-3 py-2 text-sm">
                                {x.title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="space-y-2 pt-2">
                <button className="w-full py-2 bg-gray-200 text-gray-600 rounded cursor-not-allowed" disabled>
                    Undo
                </button>
                <button className="w-full py-2 bg-gray-200 text-gray-600 rounded cursor-not-allowed" disabled>
                    Clear history
                </button>
            </div>
        </div>
    );
}