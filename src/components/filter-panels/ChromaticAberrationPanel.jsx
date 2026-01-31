import React from "react";
import ColorSlider from "../ui-elements/ColorSlider";

export default function ChromaticAberrationPanel({ params, setParams }) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Chromatic Aberration</h3>

            <p className="mb-4 text-gray-700">
                This filter simulates optical chromatic aberration found in real camera lenses.
                Color channels drift apart near the edges of the image, creating a subtle or dramatic lens distortion effect.
            </p>

            <p className="mb-6 text-sm text-gray-500 italic">
                Higher values increase color separation toward the edges of the frame.
            </p>

            {/* Global intensity */}
            <h4 className="text-md font-semibold mb-2 text-purple-600">Lens Strength</h4>
            <ColorSlider
                label="Radial Strength"
                value={params.radialStrength}
                onChange={val => setParams({ ...params, radialStrength: val })}
                color="purple"
                min={0}
                max={200}
            />

            {/* Red */}
            <h4 className="text-md font-semibold mt-6 mb-2 text-red-600">
                Red Channel
            </h4>
            <ColorSlider
                label="Red Strength"
                value={params.redStrength}
                onChange={val => setParams({ ...params, redStrength: val })}
                color="red"
                min={0}
                max={100}
                step={0.05}
            />

            {/* Green */}
            <h4 className="text-md font-semibold mt-4 mb-2 text-green-600">
                Green Channel
            </h4>
            <ColorSlider
                label="Green Strength"
                value={params.greenStrength}
                onChange={val => setParams({ ...params, greenStrength: val })}
                color="green"
                min={0}
                max={100}
                step={0.05}
            />

            {/* Blue */}
            <h4 className="text-md font-semibold mt-4 mb-2 text-blue-600">
                Blue Channel
            </h4>
            <ColorSlider
                label="Blue Strength"
                value={params.blueStrength}
                onChange={val => setParams({ ...params, blueStrength: val })}
                color="blue"
                min={0}
                max={100}
                step={0.05}
            />
        </div>
    );
}