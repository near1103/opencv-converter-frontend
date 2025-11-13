import React from 'react';
import NeutralSlider from "../ui-elements/NeutralSlider";

export default function PixelatePanel({ params, setParams }) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Pixelate Settings</h3>

            <p className="mb-4 text-gray-700">
                The Pixelate filter reduces image detail by grouping pixels into blocks of a specified size,
                creating a mosaic-like effect.
            </p>

            <p className="mb-6 text-sm text-gray-500 italic">
                Increasing the block size enlarges each pixelated block, making the image appear more pixelated.
                Smaller values preserve more detail.
            </p>

            <NeutralSlider
                label="Block Size"
                value={params.blockSize}
                onChange={val => setParams({ ...params, blockSize: val })}
                min={1}
                max={100}
            />
        </div>
    );
}
