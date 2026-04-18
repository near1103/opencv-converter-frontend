import React, { useMemo, useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import {
    FaHistory,
    FaFilter,
    FaArrowsAlt,
    FaEdit,
    FaSearch,
    FaUndoAlt,
    FaRedoAlt,
    FaTrashAlt,
} from "react-icons/fa";

const CATEGORY_META = {
    ALL: { label: "All", icon: <FaHistory /> },
    FILTER: { label: "Filters", icon: <FaFilter /> },
    TRANSFORM: { label: "Transformations", icon: <FaArrowsAlt /> },
    MANUAL: { label: "Manual", icon: <FaEdit /> },
    SYSTEM: { label: "System", icon: <FaHistory /> },
};

export default function HistoryViewPanel({
                                             items = [],
                                             canUndo = false,
                                             canRedo = false,
                                             onUndo,
                                             onRedo,
                                             onClear,
                                         }) {
    const [category, setCategory] = useState("ALL");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(items[items.length - 1]?.id ?? null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        return items.filter((x) => {
            const catOk = category === "ALL" || x.category === category;
            const qOk =
                !q ||
                x.title?.toLowerCase().includes(q) ||
                x.subtitle?.toLowerCase().includes(q);
            return catOk && qOk;
        });
    }, [items, category, query]);

    const selected = useMemo(
        () => items.find((x) => x.id === selectedId) || filtered[filtered.length - 1] || null,
        [items, selectedId, filtered]
    );

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>
                    History shows the confirmed operations applied to the current image.
                    Undo and redo restore saved image snapshots.
                </p>
            </div>

            <div className="bg-white border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FaHistory />
                        History tools
                    </h3>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onUndo}
                            disabled={!canUndo}
                            className="px-3 py-2 rounded border text-sm disabled:opacity-50"
                        >
              <span className="inline-flex items-center gap-2">
                <FaUndoAlt />
                Undo
              </span>
                        </button>

                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            className="px-3 py-2 rounded border text-sm disabled:opacity-50"
                        >
              <span className="inline-flex items-center gap-2">
                <FaRedoAlt />
                Redo
              </span>
                        </button>

                        <button
                            onClick={onClear}
                            className="px-3 py-2 rounded border text-sm"
                        >
              <span className="inline-flex items-center gap-2">
                <FaTrashAlt />
                Clear
              </span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 border rounded px-3 py-2">
                    <FaSearch className="text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search operations..."
                        className="w-full outline-none text-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {Object.entries(CATEGORY_META).map(([key, meta]) => {
                        const active = category === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setCategory(key)}
                                className={`px-3 py-2 rounded border text-sm flex items-center gap-2 transition ${
                                    active
                                        ? "bg-blue-100 border-blue-300 text-blue-900"
                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {meta.icon}
                                {meta.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white border rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-gray-800">Selected operation</h4>

                {selected ? (
                    <div className="text-sm text-gray-700">
                        <div className="font-medium">{selected.title}</div>
                        <div className="text-gray-500">{selected.subtitle || "No details"}</div>
                        <div className="text-xs text-gray-400 mt-1">
                            {selected.time} • Category: {selected.category} • Status: {selected.status}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">No operation selected.</div>
                )}
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-3 py-2 border-b font-semibold text-gray-800">
                    Operations ({filtered.length})
                </div>

                {filtered.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No operations found.</div>
                ) : (
                    filtered.map((x) => {
                        const isSel = x.id === selected?.id;
                        const Icon =
                            x.category === "FILTER"
                                ? FaFilter
                                : x.category === "TRANSFORM"
                                    ? FaArrowsAlt
                                    : x.category === "MANUAL"
                                        ? FaEdit
                                        : FaHistory;

                        return (
                            <button
                                key={x.id}
                                onClick={() => setSelectedId(x.id)}
                                className={`w-full text-left px-3 py-3 flex items-start gap-3 transition border-b last:border-b-0 ${
                                    isSel ? "bg-blue-50" : "hover:bg-gray-50"
                                }`}
                            >
                                <div className="mt-1 text-gray-500">
                                    <Icon />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between gap-3">
                                        <div className="font-medium text-gray-800">{x.title}</div>
                                        <div className="text-xs text-gray-400 whitespace-nowrap">{x.time}</div>
                                    </div>
                                    <div className="text-sm text-gray-500">{x.subtitle || "No details"}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Category: {x.category} • Status: {x.status}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}