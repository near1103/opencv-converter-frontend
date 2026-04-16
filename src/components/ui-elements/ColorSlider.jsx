import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function ColorSlider({
                                        label,
                                        value,
                                        onChange,
                                        color = 'purple',
                                        min = 0,
                                        max = 255,
                                        step = 1,
                                    }) {
    const handleChange = (event, newValue) => {
        onChange(newValue);
    };

    return (
        <div className="mb-5">
            <label className="block mb-1 text-sm font-medium text-gray-700">
                {label}: <span className="font-semibold">{value}</span>
            </label>

            <Box sx={{ width: '100%' }}>
                <Slider
                    value={value}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    step={step}
                    valueLabelDisplay="auto"
                    sx={{
                        color: color,
                        '& .MuiSlider-thumb': {
                            width: 14,
                            height: 14,
                        },
                        '& .MuiSlider-track': {
                            height: 4,
                        },
                        '& .MuiSlider-rail': {
                            height: 4,
                            opacity: 0.5,
                        },
                    }}
                />
            </Box>
        </div>
    );
}

