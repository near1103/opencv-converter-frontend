import React from "react";

export default function ColorSlider({ label, value, onChange, color = "#777", min = 0, max = 255, step = 1 }) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="mb-5">
            <label className="block mb-1 text-sm font-medium text-gray-700">
                {label}: <span className="font-semibold">{value}</span>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="color-slider"
                style={{
                    '--slider-color': color,
                    background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #ddd ${percentage}%, #ddd 100%)`,
                }}
            />
        </div>
    );
}
