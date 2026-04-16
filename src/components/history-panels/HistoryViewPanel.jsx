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
    FaCheckCircle,
} from "react-icons/fa";
import { MdOutlineAccessTime } from "react-icons/md";

const MOCK_ITEMS = [
    {
        id: "h1",
        category: "FILTER",
        title: "Background Removal",
        subtitle: "threshold=12, rgb=(0,0,0)",
        time: "10:14",
        status: "OK",
    },
    {
        id: "h2",
        category: "FILTER",
        title: "Pixelate",
        subtitle: "blockSize=14",
        time: "10:16",
        status: "OK",
    },
    {
        id: "h3",
        category: "TRANSFORM",
        title: "Rotate",
        subtitle: "angle=90°",
        time: "10:18",
        status: "PLANNED",
    },
    {
        id: "h4",
        category: "MANUAL",
        title: "Color Fill",
        subtitle: "color=#3B82F6, tolerance=20",
        time: "10:19",
        status: "PLANNED",
    },
];

const CATEGORY_META = {
    ALL: { label: "All", icon: <FaHistory /> },
    FILTER: { label: "Filters", icon: <FaFilter /> },
    TRANSFORM: { label: "Transformations", icon: <FaArrowsAlt /> },
    MANUAL: { label: "Manual", icon: <FaEdit /> },
};

export default function HistoryViewPanel() {
    const [category, setCategory] = useState("ALL");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(MOCK_ITEMS[0].id);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return MOCK_ITEMS.filter((x) => {
            const catOk = category === "ALL" || x.category === category;
            const qOk =
                !q ||
                x.title.toLowerCase().includes(q) ||
                x.subtitle.toLowerCase().includes(q);
            return catOk && qOk;
        });
    }, [category, query]);

    const selected = useMemo(
        () => MOCK_ITEMS.find((x) => x.id === selectedId),
        [selectedId]
    );

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start gap-2 text-gray-700">
                <HiOutlineInformationCircle className="mt-0.5" />
                <p>
                    History shows the sequence of operations applied to the current image.
                    This is a UI stub (data will be loaded from Firestore later).
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <FaHistory />
                    <span>History tools</span>
                </div>

                <div className="flex gap-2">
                    <button
                        disabled
                        className="flex-1 py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
                        title="Undo will be enabled after history is implemented"
                    >
                        <FaUndoAlt /> Undo
                    </button>
                    <button
                        disabled
                        className="flex-1 py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
                        title="Redo will be enabled after history is implemented"
                    >
                        <FaRedoAlt /> Redo
                    </button>
                    <button
                        disabled
                        className="flex-1 py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
                        title="Clear history will be enabled after history is implemented"
                    >
                        <FaTrashAlt /> Clear
                    </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 border rounded px-2 py-2">
                    <FaSearch className="text-gray-500" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search operations..."
                        className="w-full outline-none text-sm"
                    />
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                    {Object.entries(CATEGORY_META).map(([key, meta]) => {
                        const active = category === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setCategory(key)}
                                className={`px-3 py-2 rounded border text-sm flex items-center gap-2 transition
                  ${
                                    active
                                        ? "bg-blue-100 border-blue-300 text-blue-900"
                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {meta.icon} {meta.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected details */}
            <div className="bg-white border rounded-lg p-3 space-y-2">
                <div className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    <FaCheckCircle /> Selected operation
                </div>
                {selected ? (
                    <div className="text-sm text-gray-700 space-y-1">
                        <div className="font-semibold">{selected.title}</div>
                        <div className="text-gray-600">{selected.subtitle}</div>
                        <div className="text-gray-500 flex items-center gap-2">
                            <MdOutlineAccessTime /> {selected.time} • Category:{" "}
                            <b>{selected.category}</b> • Status: <b>{selected.status}</b>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-600">No operation selected.</div>
                )}
            </div>

            {/* List */}
            <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-3 py-2 border-b text-sm font-semibold text-blue-900">
                    Operations ({filtered.length})
                </div>

                {filtered.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-gray-600">
                        No operations found.
                    </div>
                ) : (
                    <ul className="divide-y">
                        {filtered.map((x) => {
                            const isSel = x.id === selectedId;
                            const Icon =
                                x.category === "FILTER"
                                    ? FaFilter
                                    : x.category === "TRANSFORM"
                                        ? FaArrowsAlt
                                        : FaEdit;

                            return (
                                <li key={x.id}>
                                    <button
                                        onClick={() => setSelectedId(x.id)}
                                        className={`w-full text-left px-3 py-3 flex items-start gap-3 transition
                      ${isSel ? "bg-blue-50" : "hover:bg-gray-50"}`}
                                    >
                                        <div className="mt-1 text-blue-700">
                                            <Icon />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {x.title}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MdOutlineAccessTime /> {x.time}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-600">{x.subtitle}</div>
                                            <div className="text-xs text-gray-500 pt-1">
                                                Category: <b>{x.category}</b> • Status: <b>{x.status}</b>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 text-blue-900 text-sm flex items-start gap-2">
                <HiOutlineInformationCircle className="mt-0.5" />
                <div>
                    Planned behavior: each operation is stored in Firestore with tool name,
                    parameters and timestamp. Undo/Redo will restore the previous version of
                    the image.
                </div>
            </div>
        </div>
    );
}