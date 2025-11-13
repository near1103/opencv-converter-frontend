import React from 'react';

export default function FormatSelector({ selectedFormat, setSelectedFormat, formatOptions, loading, disabled }) {
    return (
        <div className="flex flex-col items-center space-y-3 w-full max-w-md mt-6">
            <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                disabled={loading || disabled}
                className="w-full border border-blue-300 rounded px-4 py-2 text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                {formatOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
        </div>
    );
}