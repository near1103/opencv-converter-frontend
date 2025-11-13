import React, { useEffect, useState } from 'react';
import { useUser } from '../../UserContext';
import { fetchUserImages } from '../../api';
import SavedImage from '../../components/ui-elements/SavedImage';
import Navbar from '../../components/Navbar';

export default function SavedImagesPage() {
    const { user } = useUser();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.uid) return;

        setLoading(true);
        fetchUserImages(user.uid)
            .then(setImages)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [user]);

    const handleDelete = (deletedPath) => {
        setImages((prevImages) => prevImages.filter((path) => path !== deletedPath));
    };

    return (
        <div className="flex flex-col h-screen bg-blue-50">
            <Navbar />
            <main className="flex-1 overflow-auto p-6">
                <h1 className="text-3xl font-extrabold mb-6 text-blue-900 drop-shadow-md">
                    Saved Images
                </h1>

                {loading && (
                    <p className="text-blue-700 font-semibold text-center mt-10">Loading...</p>
                )}
                {error && (
                    <p className="text-red-600 font-semibold text-center mt-10">Error: {error}</p>
                )}
                {!loading && images.length === 0 && (
                    <p className="text-gray-600 text-center mt-10">You didn't save any images.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((path, index) => (
                        <SavedImage key={index} path={path} onDelete={handleDelete} />
                    ))}
                </div>
            </main>
        </div>
    );
}
