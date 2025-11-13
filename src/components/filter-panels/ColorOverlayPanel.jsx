import React from 'react';
import NeutralSlider from "../ui-elements/NeutralSlider";
import ColorSlider from "../ui-elements/ColorSlider";

export default function ColorOverlayPanel({ params, setParams }) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Color Overlay Settings</h3>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Color Preview</label>
                <div className="flex items-center gap-3">
                    <div
                        className="w-16 h-16 border-2 border-gray-300 rounded-lg shadow-sm"
                        style={{
                            backgroundColor: `rgba(${params.red}, ${params.green}, ${params.blue}, ${params.alpha})`
                        }}
                    />
                    <div className="text-sm text-gray-600">
                        <div>RGB({params.red}, {params.green}, {params.blue})</div>
                        <div>Alpha: {params.alpha}</div>
                    </div>
                </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                The Color Overlay filter applies a semi-transparent color layer on top of the image.
            </div>

            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                Adjust the Red, Green, and Blue sliders to select the overlay color. Use the Alpha slider to control the transparency — 0 means fully transparent, 1 means fully opaque.
            </div>

            <ColorSlider
                label="Red"
                value={params.red}
                onChange={(val) => setParams({ ...params, red: val })}
                color="red"
                min={0}
                max={255}
            />

            <ColorSlider
                label="Green"
                value={params.green}
                onChange={(val) => setParams({ ...params, green: val })}
                color="green"
                min={0}
                max={255}
            />

            <ColorSlider
                label="Blue"
                value={params.blue}
                onChange={(val) => setParams({ ...params, blue: val })}
                color="blue"
                min={0}
                max={255}
            />

            <NeutralSlider
                label="Alpha"
                value={params.alpha}
                onChange={(val) => setParams({ ...params, alpha: val })}
                min={0}
                max={1}
                step={0.01}
            />
        </div>
    );
}