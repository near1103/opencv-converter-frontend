import NeutralSlider from "../ui-elements/NeutralSlider";
import React from 'react';

export default function GaussianBlurPanel({ params, setParams }) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Gaussian Blur Settings</h3>

            <p className="mb-4 text-gray-700">
                Applies a Gaussian blur to the image, smoothing it by averaging pixels with a weighted kernel that gives more importance to central pixels.
            </p>

            <p className="mb-6 text-sm text-gray-500 italic">
                <strong>Kernel Size</strong>: defines the size of the Gaussian kernel. Larger sizes increase the blur effect but may reduce image details.
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
