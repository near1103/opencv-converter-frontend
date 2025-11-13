import React, { useState, useCallback } from 'react';
import NeutralSlider from "../ui-elements/NeutralSlider";

export default function BackgroundPanel({ params, setParams, onColorPickerToggle, colorPickerActive }) {
    const handleColorPick = useCallback((color) => {
        console.log('BackgroundPanel handleColorPick called with:', color);
        setParams({
            ...params,
            red: color.red,
            green: color.green,
            blue: color.blue
        });
    }, [params, setParams]);


    const handleToggleColorPicker = useCallback(() => {
        const newActive = !colorPickerActive;
        console.log('Toggling color picker:', newActive, 'Handler:', handleColorPick);

        if (onColorPickerToggle) {
            onColorPickerToggle(newActive, newActive ? handleColorPick : null);
        }
    }, [colorPickerActive, onColorPickerToggle, handleColorPick]);

    const selectedColor = {
        red: params.red || 0,
        green: params.green || 0,
        blue: params.blue || 0
    };

    return (
        <div className="p-4 space-y-6">
            <div>
                <h3 className="text-lg font-bold mb-2">Remove Background Settings</h3>
                <p className="text-sm text-gray-600">
                    Click the color picker button below, then click on the background color in the image to select it.
                </p>
            </div>

            <div className="border-t pt-4">
                <h4 className="font-medium mb-3 text-gray-800">Background Color Selection</h4>

                <button
                    onClick={handleToggleColorPicker}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 mb-4 ${
                        colorPickerActive
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <span className="flex items-center justify-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.93-1.41 1.41 1.93 1.93L3.29 16.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.17 11.6l1.93 1.93 1.41-1.41-1.93-1.93 3.13-3.12c.38-.38.38-1.02-.01-1.44zM6.83 18.36l-.94-.94 8.48-8.48.94.94-8.48 8.48z"/>
                        </svg>
                        <span>
                            {colorPickerActive ? 'Color Picker Active - Click on Image' : 'Activate Color Picker'}
                        </span>
                    </span>
                </button>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div
                        className="w-12 h-12 rounded border-2 border-gray-300 flex-shrink-0"
                        style={{
                            backgroundColor: `rgb(${selectedColor.red}, ${selectedColor.green}, ${selectedColor.blue})`
                        }}
                    />
                    <div className="text-sm">
                        <div className="font-medium text-gray-800">Selected Background Color:</div>
                        <div className="text-gray-600">
                            RGB({selectedColor.red}, {selectedColor.green}, {selectedColor.blue})
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t pt-4">
                <h4 className="font-medium mb-3 text-gray-800">Manual Color Input</h4>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Red</label>
                        <input
                            type="number"
                            min="0"
                            max="255"
                            value={params.red || 0}
                            onChange={(e) => setParams({ ...params, red: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Green</label>
                        <input
                            type="number"
                            min="0"
                            max="255"
                            value={params.green || 0}
                            onChange={(e) => setParams({ ...params, green: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Blue</label>
                        <input
                            type="number"
                            min="0"
                            max="255"
                            value={params.blue || 0}
                            onChange={(e) => setParams({ ...params, blue: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t pt-4">
                <h4 className="font-medium mb-3 text-gray-800">Sensitivity</h4>
                <NeutralSlider
                    label="Threshold"
                    value={params.threshold || 5.0}
                    onChange={val => setParams({ ...params, threshold: val })}
                    min={0}
                    max={100}
                    step={0.1}
                />
                <p className="text-xs text-gray-500 mt-2">
                    Higher values remove more similar colors. Lower values are more precise.
                </p>
            </div>
        </div>
    );
}