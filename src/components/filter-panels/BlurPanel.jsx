import React from 'react';
import NeutralSlider from "../ui-elements/NeutralSlider";

export default function BlurPanel({ params, setParams }) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Blur Settings</h3>

            <p className="mb-4 text-gray-700">
                Applies a blur effect to the image by averaging pixels within a kernel area, softening details.
            </p>

            <p className="mb-6 text-sm text-gray-500 italic">
                <strong>Kernel Size</strong>: controls the size of the area used to calculate the blur. Larger values produce a stronger blur.
            </p>

            <NeutralSlider
                label="Kernel Size"
                value={params.kernelSize}
                onChange={val => setParams({ ...params, kernelSize: val })}
                min={1}
                max={31}
                step={2}
            />
        </div>
    );
}