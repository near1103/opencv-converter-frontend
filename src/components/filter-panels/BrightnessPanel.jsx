import NeutralSlider from "../ui-elements/NeutralSlider";
import React from 'react'

export default function BrightnessPanel({ params, setParams }) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Brightness Settings</h3>

            <p className="mb-4 text-gray-700">
                Adjusts the overall brightness of the image by adding a constant value to all pixels.
            </p>

            <p className="mb-6 text-sm text-gray-500 italic">
                <strong>Brightness</strong>: positive values lighten the image, negative values darken it.
            </p>

            <NeutralSlider
                label="Brightness"
                value={params.brightness}
                onChange={val => setParams({ ...params, brightness: val })}
                min={-100}
                max={100}
            />
        </div>
    );
}
