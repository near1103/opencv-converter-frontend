import React from 'react';
import { useDropzone } from 'react-dropzone';

export default function ImageDropZone({ onDrop, imageSrc }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
    });

    if (imageSrc) return null;

    return (
        <div {...getRootProps()} className="w-full flex justify-center">
            <input {...getInputProps()} />
            <div className="border-2 border-dashed border-gray-400 rounded h-[60vh] w-full max-w-xl flex items-center justify-center cursor-pointer
                hover:border-blue-500 transition-colors px-4 text-center text-gray-500 text-lg">
                {isDragActive ? 'Drop the file here' : 'Drag and drop an image here or click to upload'}
            </div>
        </div>
    );
}
