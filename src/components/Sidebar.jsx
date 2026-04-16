import React from "react";
import { FaFilter, FaArrowsAlt, FaEdit, FaHistory } from "react-icons/fa";

const MENU_ITEMS = [
    { id: "filters", label: "Filters", icon: <FaFilter size={22} /> },
    { id: "transformations", label: "Transformations", icon: <FaArrowsAlt size={22} /> },
    { id: "manualEdit", label: "Manual Editing", icon: <FaEdit size={22} /> },
    { id: "history", label: "History", icon: <FaHistory size={22} /> },
];


export default function Sidebar({
                                    activeMenu,
                                    setActiveMenu,
                                    activeFilter,
                                    setActiveFilter,
                                    filters,
                                    activeTool,
                                    setActiveTool,
                                    transformTools,
                                    manualTools,
                                    historyTools,
                                }) {
    const getToolsForMenu = (menuId) => {
        if (menuId === "transformations") return transformTools;
        if (menuId === "manualEdit") return manualTools;
        if (menuId === "history") return historyTools;
        return [];
    };

    return (
        <aside className="w-64 bg-blue-50 p-4 overflow-auto border-r border-blue-300 flex flex-col">
            {MENU_ITEMS.map(({ id, label, icon }) => {
                const isActive = activeMenu === id;
                const tools = getToolsForMenu(id);

                return (
                    <div key={id} className="mb-2">
                        <button
                            onClick={() => {
                                const nextActive = isActive ? null : id;
                                setActiveMenu(nextActive);


                                if (id !== "filters") setActiveFilter(null);
                                if (id === "filters") setActiveTool(null);
                                if (id !== "filters" && !isActive) setActiveTool(null);
                            }}
                            className={`flex items-center space-x-2 w-full rounded px-3 py-2 transition-colors duration-200
                ${isActive ? "bg-blue-300 text-blue-900 font-semibold" : "text-blue-700 hover:bg-blue-200 hover:text-blue-900"}
              `}
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                        </button>

                        {/* Filters submenu */}
                        {isActive && id === "filters" && (
                            <div className="mt-1 bg-white shadow-md rounded border border-blue-200">
                                {filters.map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setActiveFilter(activeFilter === f ? null : f)}
                                        className={`block w-full text-left px-3 py-2 text-sm transition-colors duration-150
                      ${activeFilter === f ? "bg-blue-200 font-semibold text-blue-900" : "hover:bg-blue-100"}
                    `}
                                    >
                                        {f.replace(/_/g, " ")}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Other menus submenu */}
                        {isActive && id !== "filters" && (
                            <div className="mt-1 bg-white shadow-md rounded border border-blue-200">
                                {tools.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTool(activeTool === t ? null : t)}
                                        className={`block w-full text-left px-3 py-2 text-sm transition-colors duration-150
                      ${activeTool === t ? "bg-blue-200 font-semibold text-blue-900" : "hover:bg-blue-100"}
                    `}
                                    >
                                        {t.replace(/_/g, " ")}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </aside>
    );
}
