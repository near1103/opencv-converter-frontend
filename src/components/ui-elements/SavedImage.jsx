import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUserImage, getAuthToken} from "../../api";
export default function SavedImage({ id, onDelete }) {
    const [src, setSrc] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;

        let objectUrl;

        const loadImage = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = getAuthToken();
                if (!token) throw new Error("Not authenticated");

                const res = await fetch(`/api/images/${encodeURIComponent(id)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                setSrc(objectUrl);
            } catch (e) {
                setError(e.message || "Failed to load image");
            } finally {
                setLoading(false);
            }
        };

        loadImage();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [id]);

    const onClick = () => {
        navigate("/", { state: { imageId: id } });
    };

    const handleDelete = async (e) => {
        e.stopPropagation();

        try {
            await deleteUserImage(id);
            onDelete?.(id);
        } catch (e) {
            console.error("Delete failed", e);
            alert(e.message || "Failed to delete image.");
        }
    };

    return (
        <div
            className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-white border border-gray-300 flex items-center justify-center h-64"
            onClick={onClick}
        >
            {loading && <span className="text-gray-400">Loading...</span>}

            {!loading && error && (
                <span className="text-red-500 text-sm px-2">{error}</span>
            )}

            {!loading && !error && (
                <img
                    src={src}
                    alt="Saved"
                    className="max-h-full max-w-full"
                    draggable={false}
                />
            )}

            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-xs shadow"
            >
                Delete
            </button>
        </div>
    );
}