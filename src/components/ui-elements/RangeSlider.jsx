import React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

const minDistance = 10;

export default function RangeSlider({
                                        label,
                                        min = 0,
                                        max = 100,
                                        step = 1,
                                        value = [min, max],
                                        onChange,
                                    }) {
    const handleChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) return;

        let [newMin, newMax] = newValue;

        if (activeThumb === 0) {
            newMin = Math.min(newMin, value[1] - minDistance);
            onChange([newMin, value[1]]);
        } else {
            newMax = Math.max(newMax, value[0] + minDistance);
            onChange([value[0], newMax]);
        }
    };


    return (
        <div className="mb-6 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-700">
                {label}:{" "}
                <span className="text-gray-800 font-semibold">
          {value[0].toFixed(1)} — {value[1].toFixed(1)}
        </span>
            </label>

            <Box sx={{ width: "100%", px: 1 }}>
                <Slider
                    value={value}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    step={step}
                    valueLabelDisplay="auto"
                    disableSwap
                    sx={{
                        "& .MuiSlider-thumb": {
                            width: 15,
                            height: 15,
                        },
                        "& .MuiSlider-thumb.Mui-focusVisible": {
                            boxShadow: "0 0 0 6px rgba(25,118,210,0.2)", // было больше по умолчанию
                        }
                    }}
                />
            </Box>
        </div>
    );
}
