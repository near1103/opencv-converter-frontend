import React from 'react';
import NeutralSlider from "../ui-elements/NeutralSlider";

export default function ContrastPanel({ params, setParams }) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Contrast Settings</h3>

            <p className="mb-4 text-gray-700">
                Adjusts the contrast of the image by scaling pixel intensity differences from the midpoint. Higher values increase contrast, making darks darker and lights lighter.
            </p>

            <p className="mb-6 text-sm text-gray-500 italic">
                <strong>Contrast</strong>: a multiplier for contrast level. Values &lt;1 decrease contrast, values &gt;1 increase it.
            </p>

            <NeutralSlider
                label="Contrast"
                value={params.alpha}
                onChange={val => setParams({ ...params, alpha: val })}
                min={0}
                max={4}
                step={0.01}
            />
        </div>
    );
}
