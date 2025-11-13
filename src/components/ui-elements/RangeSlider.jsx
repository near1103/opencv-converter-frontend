import React from "react";

export default function RangeSlider({
                                        label,
                                        min = 0,
                                        max = 100,
                                        step = 1,
                                        value = [min, max],
                                        onChange,
                                    }) {
    const [minVal, maxVal] = value;

    const minPercent = ((minVal - min) / (max - min)) * 100;
    const maxPercent = ((maxVal - min) / (max - min)) * 100;

    const handleMinChange = (e) => {
        const val = Math.min(Number(e.target.value), maxVal - step);
        onChange([val, maxVal]);
    };

    const handleMaxChange = (e) => {
        const val = Math.max(Number(e.target.value), minVal + step);
        onChange([minVal, val]);
    };

    return (
        <div className="mb-6 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-700">
                {label}:{" "}
                <span className="text-gray-800 font-semibold">
          {minVal.toFixed(1)} — {maxVal.toFixed(1)}
        </span>
            </label>

            <div className="relative w-full h-8 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minVal}
                    onChange={handleMinChange}
                    className="absolute w-full h-2 appearance-none pointer-events-auto"
                    style={{
                        zIndex: 3,
                    }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxVal}
                    onChange={handleMaxChange}
                    className="absolute w-full h-2 appearance-none pointer-events-auto"
                    style={{
                        zIndex: 4,
                    }}
                />

                {/* Фон с подсветкой выбранного диапазона */}
                <div
                    className="absolute h-2 rounded-full"
                    style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`,
                        background: "#6b7280",
                        zIndex: 1,
                    }}
                />
                <div
                    className="absolute w-full h-2 bg-gray-300 rounded-full"
                    style={{ zIndex: 0 }}
                />
            </div>

            <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
          pointer-events: all;
          border-radius: 9999px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #6b7280;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
          position: relative;
          z-index: 5;
          margin-top: -8px;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #4b5563;
          transform: scale(1.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #6b7280;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
          position: relative;
          z-index: 5;
        }
        input[type="range"]::-moz-range-thumb:hover {
          background: #4b5563;
          transform: scale(1.1);
        }
        input[type="range"]::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 9999px;
          background: transparent;
        }
        input[type="range"]::-moz-range-track {
          height: 6px;
          border-radius: 9999px;
          background: transparent;
        }
      `}</style>
        </div>
    );
}
