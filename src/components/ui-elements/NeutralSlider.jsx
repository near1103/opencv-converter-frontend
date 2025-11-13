import React from 'react';

export default function NeutralSlider({
                                          label,
                                          value,
                                          onChange,
                                          min = 0,
                                          max = 100,
                                          step = 1,
                                      }) {
    const safeValue = Number(value);
    const percentage = ((safeValue - min) / (max - min)) * 100;

    return (
        <div className="mb-6 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-700">
                {label}: <span className="text-gray-800 font-semibold">{safeValue}</span>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={safeValue}
                onChange={e => onChange(Number(e.target.value))}
                className="neutral-slider w-full h-2 appearance-none cursor-pointer transition-all duration-300 focus:outline-none"
                style={{
                    background: `linear-gradient(to right, #6b7280 0%, #6b7280 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                }}
            />
            <style jsx>{`
                .neutral-slider {
                    border-radius: 9999px;
                }

                .neutral-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #6b7280; /* gray-500 */
                    border: 2px solid white;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                    transition: background 0.3s ease, transform 0.2s ease;
                    margin-top: -6px; /* <-- было -8px, стало -6px */
                    position: relative;
                    z-index: 2;
                }

                .neutral-slider::-webkit-slider-thumb:hover {
                    background: #4b5563; /* gray-600 */
                    transform: scale(1.1);
                }

                .neutral-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #6b7280;
                    border: 2px solid white;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                    transition: background 0.3s ease, transform 0.2s ease;
                }

                .neutral-slider::-moz-range-thumb:hover {
                    background: #4b5563;
                    transform: scale(1.1);
                }

                .neutral-slider::-webkit-slider-runnable-track {
                    height: 6px;
                    border-radius: 9999px;
                    background: transparent;
                }

                .neutral-slider::-moz-range-track {
                    height: 6px;
                    border-radius: 9999px;
                    background: transparent;
                }
            `}</style>
        </div>
    );
}
