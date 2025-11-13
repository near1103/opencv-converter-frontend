import React from "react";
import RangeSlider from "../ui-elements/RangeSlider";

export default function EdgeDetectionPanel({ params, setParams }) {

    const threshold1 = Number(params.threshold1) || 0;
    const threshold2 = Number(params.threshold2) || 255;

    const handleChange = ([newThreshold1, newThreshold2]) => {
        setParams({
            ...params,
            threshold1: newThreshold1,
            threshold2: newThreshold2,
        });
    };

    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Edge Detection Settings</h3>

            <p className="mb-4 text-gray-700">
                The Edge Detection filter highlights the edges in the image using the Canny algorithm.
            </p>

            <p className="mb-6 text-sm text-gray-500 italic">
                Adjust the threshold range to control edge sensitivity. Lower values detect weaker edges, while higher values focus on stronger edges. The first threshold is the lower bound, and the second is the upper bound for edge detection.
            </p>

            <RangeSlider
                label="Threshold Range"
                min={0}
                max={255}
                step={0.1}
                value={[threshold1, threshold2]}
                onChange={handleChange}
            />
        </div>
    );
}
