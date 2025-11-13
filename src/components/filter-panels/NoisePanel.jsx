import NeutralSlider from "../ui-elements/NeutralSlider";
import React from 'react'

export default function NoisePanel({ params, setParams }) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Noise Settings</h3>

            <p className="mb-4 text-gray-700">
                Adds random noise to the image, simulating grain or static.
            </p>

            <p className="mb-6 text-sm text-gray-500 italic">
                <strong>Mean</strong>: sets the average brightness of the noise (negative values darken, positive brighten).<br />
                <strong>Stddev</strong>: controls the intensity/spread of the noise; higher values produce more noticeable noise.
            </p>

            <NeutralSlider label="Mean" value={params.mean} onChange={val => setParams({ ...params, mean: val })} min={-50} max={50} step={0.1} />
            <NeutralSlider label="Stddev" value={params.stddev} onChange={val => setParams({ ...params, stddev: val })} min={0} max={50} step={0.1} />
        </div>
    );
}
