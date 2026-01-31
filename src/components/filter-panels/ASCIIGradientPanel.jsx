import React from "react";
import ColorSlider from "../ui-elements/ColorSlider";

const GRADIENT_PRESETS = {
    "Recommended": " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    "Classic": " .:-=+*#%@",
    "Soft": "  .'`,:;irsXA253hMHGS#9B&",
    "Contrast": "  ..::--==++**##%%@@",
    "Minimal": " .:-=#"
};

export default function ASCIIGradientPanel({ params, setParams }) {

    const effectiveGradient =
        params.customGradient?.length > 0
            ? params.customGradient
            : GRADIENT_PRESETS[params.preset];

    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">ASCII Art Settings</h3>

            <p className="mb-4 text-gray-700">
                Configure the ASCII rendering. Choose a preset, override it with a custom gradient,
                adjust character size, or invert brightness.
            </p>

            {/* Preset gradient */}
            <h4 className="text-md font-semibold mb-2 text-purple-600">
                Preset Gradient
            </h4>
            <select
                className="w-full p-2 border rounded mb-4"
                value={params.preset}
                onChange={e =>
                    setParams({
                        ...params,
                        preset: e.target.value,
                        customGradient: ""
                    })
                }
            >
                {Object.keys(GRADIENT_PRESETS).map(key => (
                    <option key={key} value={key}>
                        {key}
                    </option>
                ))}
            </select>

            {/* Custom gradient */}
            <h4 className="text-md font-semibold mb-2 text-green-600">
                Custom Gradient
            </h4>
            <input
                type="text"
                className="w-full p-2 border rounded mb-4 font-mono"
                value={params.customGradient}
                onChange={e =>
                    setParams({ ...params, customGradient: e.target.value })
                }
                placeholder="From light to dark (e.g. .:-=+*#%@)"
            />

            {/* Block size */}
            <h4 className="text-md font-semibold mb-2 text-blue-600">
                Block Size
            </h4>
            <ColorSlider
                label="Block Size (px)"
                value={params.blockSize}
                onChange={val =>
                    setParams({ ...params, blockSize: val })
                }
                color="blue"
                min={4}
                max={24}
                step={1}
            />

            {/* Invert */}
            <div className="mt-4 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={params.invert}
                    onChange={e =>
                        setParams({ ...params, invert: e.target.checked })
                    }
                />
                <span className="text-sm text-gray-700">
                    Invert color
                </span>
            </div>

            {/* Preview */}
            <h4 className="text-md font-semibold mt-6 mb-2 text-gray-700">
                Active Gradient Preview
            </h4>
            <div className="p-2 border rounded bg-gray-100 font-mono text-sm overflow-x-auto">
                {effectiveGradient}
            </div>
        </div>
    );
}
