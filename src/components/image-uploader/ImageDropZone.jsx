import React from "react";
import { useDropzone } from "react-dropzone";

export default function ImageDropZone({ onDrop, imageSrc }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles, fileRejections) => {
            onDrop?.(acceptedFiles, fileRejections);
        },
        accept: {
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/webp": [".webp"],
            "image/gif": [".gif"],
            "image/bmp": [".bmp"],
            "image/x-icon": [".ico"],
            "image/tiff": [".tif", ".tiff"],
            "image/x-tga": [".tga"],
            "image/x-portable-anymap": [".pnm"],
        },
        maxFiles: 1,
    });

    if (imageSrc) return null;

    return (
        <div {...getRootProps()} className="w-full flex justify-center">
            <input {...getInputProps()} />
            <div
                className="border-2 border-dashed border-gray-400 rounded h-[60vh] w-full max-w-xl flex items-center justify-center cursor-pointer
                hover:border-blue-500 transition-colors px-4 text-center text-gray-500 text-lg"
            >
                {isDragActive
                    ? "Drop the file here"
                    : "Drag and drop an image here or click to upload"}
            </div>
        </div>
    );
}