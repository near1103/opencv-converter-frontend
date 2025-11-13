import React from "react";
import ColorSlider from "../ui-elements/ColorSlider";

export default function RGBShiftPanel({ params, setParams }) {
        return (
            <div className="p-4">
                    <h3 className="text-lg font-bold mb-4">RGB Shift Settings</h3>

                    <p className="mb-4 text-gray-700">
                            The RGB Shift filter displaces the red, green, and blue color channels separately to create a chromatic aberration or glitch effect.
                            Adjust the X and Y offsets for each color channel to control the direction and intensity of the shift.
                    </p>

                    <p className="mb-6 text-sm text-gray-500 italic">
                            Positive values shift the channel right/down, negative values shift left/up.
                    </p>

                    <h4 className="text-md font-semibold mb-2 text-red-600">Red Channel</h4>
                    <ColorSlider
                        label="Red X Offset"
                        value={params.redDx}
                        onChange={val => setParams({ ...params, redDx: val })}
                        color="red"
                        min={-50}
                        max={50}
                    />
                    <ColorSlider
                        label="Red Y Offset"
                        value={params.redDy}
                        onChange={val => setParams({ ...params, redDy: val })}
                        color="red"
                        min={-50}
                        max={50}
                    />

                    <h4 className="text-md font-semibold mt-4 mb-2 text-green-600">Green Channel</h4>
                    <ColorSlider
                        label="Green X Offset"
                        value={params.greenDx}
                        onChange={val => setParams({ ...params, greenDx: val })}
                        color="green"
                        min={-50}
                        max={50}
                    />
                    <ColorSlider
                        label="Green Y Offset"
                        value={params.greenDy}
                        onChange={val => setParams({ ...params, greenDy: val })}
                        color="green"
                        min={-50}
                        max={50}
                    />

                    <h4 className="text-md font-semibold mt-4 mb-2 text-blue-600">Blue Channel</h4>
                    <ColorSlider
                        label="Blue X Offset"
                        value={params.blueDx}
                        onChange={val => setParams({ ...params, blueDx: val })}
                        color="blue"
                        min={-50}
                        max={50}
                    />
                    <ColorSlider
                        label="Blue Y Offset"
                        value={params.blueDy}
                        onChange={val => setParams({ ...params, blueDy: val })}
                        color="blue"
                        min={-50}
                        max={50}
                    />
            </div>
        );
}
