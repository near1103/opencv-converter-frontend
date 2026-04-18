import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProject, getAuthToken } from "../../api";

export default function SavedImage({ project, onDelete }) {
    const navigate = useNavigate();

    const {
        projectId,
        name,
        resultFormatId,
        updatedAt,
        operationsCount,
        previewTool,
    } = project;

    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewError, setPreviewError] = useState(false);

    useEffect(() => {
        let objectUrl = null;

        const loadPreview = async () => {
            try {
                const token = getAuthToken();
                if (!token) throw new Error("Not authenticated");

                const res = await fetch(
                    `/api/projects/${encodeURIComponent(projectId)}/image`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                setPreviewUrl(objectUrl);
                setPreviewError(false);
            } catch (error) {
                console.error("Failed to load project preview:", error);
                setPreviewError(true);
            }
        };

        loadPreview();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [projectId]);

    const handleDelete = async (e) => {
        e.stopPropagation();

        try {
            await deleteProject(projectId);
            onDelete?.(projectId);
        } catch (error) {
            console.error("Delete project error:", error);
            alert("Failed to delete project.");
        }
    };

    const handleOpen = () => {
        navigate("/", {
            state: {
                projectId,
            },
        });
    };

    const formattedDate = updatedAt
        ? new Date(updatedAt).toLocaleString()
        : "Unknown date";

    return (
        <div
            onClick={handleOpen}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition"
        >
            <div className="relative h-60 bg-gray-100 flex items-center justify-center overflow-hidden">
                {previewUrl && !previewError ? (
                    <img
                        src={previewUrl}
                        alt={name || "Saved project"}
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <div className="text-sm text-gray-400">Preview unavailable</div>
                )}

                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                >
                    Delete
                </button>
            </div>

            <div className="p-3 space-y-1">
                <div className="font-semibold text-gray-800 truncate">
                    {name || "Untitled project"}
                </div>

                <div className="text-sm text-gray-500">
                    Format: {resultFormatId || "unknown"}
                </div>

                <div className="text-sm text-gray-500">
                    Operations: {operationsCount ?? 0}
                </div>

                {previewTool && (
                    <div className="text-sm text-gray-500 truncate">
                        Last tool: {previewTool}
                    </div>
                )}

                <div className="text-xs text-gray-400">
                    Updated: {formattedDate}
                </div>
            </div>
        </div>
    );
}