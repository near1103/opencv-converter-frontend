import React from 'react';

export default function ImageActions({ onRemove, onReset, onSave, onSaveServer, canReset, isConverting, canSave }) {
    return (
        <div className="flex flex-wrap justify-between w-full max-w-md mt-4 space-x-4">
            <button
                onClick={onRemove}
                className="flex-1 bg-red-100 text-red-700 border border-red-300 rounded py-2 hover:bg-red-200 transition"
                disabled={isConverting}
            >
                Remove Image
            </button>
            <button
                onClick={onReset}
                className="flex-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded py-2 hover:bg-yellow-200 transition"
                disabled={!canReset || isConverting}
            >
                Reset to Original
            </button>
            <button
                onClick={onSave}
                className={`flex-1 rounded py-2 transition ${isConverting ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                disabled={!canSave || isConverting}
            >
                {isConverting ? 'Processing...' : 'Save on Computer'}
            </button>
            <button
                onClick={onSaveServer}
                className={`flex-1 rounded py-2 transition ${
                    isConverting ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                disabled={!canSave || isConverting}
            >
                {isConverting ? 'Processing...' : 'Save on Server'}
            </button>
        </div>
    );
}
