import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function NeutralSlider({
                                          label,
                                          value,
                                          onChange,
                                          min = 0,
                                          max = 100,
                                          step = 1,
                                      }) {
    const handleChange = (event, newValue) => {
        onChange(newValue);
    };

    return (
        <div className="mb-6 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-700">
                {label}: <span className="text-gray-800 font-semibold">{value}</span>
            </label>

            <Box sx={{ width: '100%', px: 1 }}>
                <Slider
                    value={value}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    step={step}
                    valueLabelDisplay="auto"
                    sx={{
                        '& .MuiSlider-thumb': {
                            width: 14,
                            height: 14,
                        },
                        '& .MuiSlider-track': {
                            height: 4,
                        },
                        '& .MuiSlider-rail': {
                            height: 4,
                        },
                    }}
                />
            </Box>
        </div>
    );
}