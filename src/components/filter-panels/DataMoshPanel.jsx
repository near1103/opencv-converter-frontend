import React from "react";
import ColorSlider from "../ui-elements/ColorSlider";

export default function DataMoshPanel({ params, setParams }) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Data Mosh Settings</h3>

            <p className="mb-4 text-gray-700">
                The Data Mosh filter simulates a “broken bitrate” effect by shifting, duplicating, and blending image blocks.
                Adjust the block size, chaos, offset, and smear parameters to control the intensity and style of the glitch.
            </p>

            <p className="mb-6 text-sm text-gray-500 italic">
                Higher chaos and max offset values create more intense, unpredictable glitches.
            </p>

            <ColorSlider
                label="Block Size"
                value={params.blockSize}
                onChange={val => setParams({ ...params, blockSize: val })}
                color="purple"
                min={4}
                max={64}
            />

            <ColorSlider
                label="Max Offset"
                value={params.maxOffset}
                onChange={val => setParams({ ...params, maxOffset: val })}
                color="purple"
                min={1}
                max={100}
            />

            <ColorSlider
                label="Chaos"
                value={params.chaos}
                onChange={val => setParams({ ...params, chaos: val })}
                color="orange"
                min={0}
                max={1}
                step={0.01}
            />

            <ColorSlider
                label="Smear"
                value={params.smear}
                onChange={val => setParams({ ...params, smear: val })}
                color="orange"
                min={0}
                max={1}
                step={0.01}
            />
        </div>
    );
}
