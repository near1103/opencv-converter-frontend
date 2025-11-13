import React from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUserImage } from '../../api';
import { getAuth } from 'firebase/auth';

export default function SavedImage({ path, onDelete }) {
    const BASE_URL = 'http://localhost:8080';
    const fullUrl = `${BASE_URL}/uploads/${path}`;
    const navigate = useNavigate();

    const onClick = () => {
        navigate('/', { state: { imageUrl: fullUrl } });
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            alert("You must be logged in to delete an image.");
            return;
        }

        try {
            await deleteUserImage(user.uid, path);
            if (onDelete) onDelete(path);
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete image.");
        }
    };

    return (
        <div
            className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-white border border-gray-300 flex items-center justify-center h-64"
            onClick={onClick}
        >
            <img
                src={fullUrl}
                alt="Saved"
                className="max-h-full max-w-full"
                style={{ display: 'block', margin: '0 auto' }}
            />
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-xs shadow"
            >
                Delete
            </button>
        </div>
    );
}
