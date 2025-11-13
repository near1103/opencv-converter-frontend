import React, {useEffect, useState, useRef} from 'react';
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import ImageUploader from "../image-uploader/ImageUploader";
import { useUser } from '../../UserContext';
import { useLocation } from 'react-router-dom';

import BackgroundPanel from "../filter-panels/BackgroundPanel";
import PixelatePanel from "../filter-panels/PixelatePanel";
import RGBShiftPanel from "../filter-panels/RGBShiftPanel";
import EdgeDetectionPanel from "../filter-panels/EdgeDetectionPanel";
import ColorOverlayPanel from "../filter-panels/ColorOverlayPanel";
import NoisePanel from "../filter-panels/NoisePanel";
import BrightnessPanel from "../filter-panels/BrightnessPanel";
import BlurPanel from "../filter-panels/BlurPanel";
import GaussianBlurPanel from "../filter-panels/GaussianBlurPanel";
import ContrastPanel from "../filter-panels/ContrastPanel";
import GrayscalePanel from "../filter-panels/GrayscalePanel";
import NegativePanel from "../filter-panels/NegativePanel";
import {sendFilterRequest} from "../../api";

const FILTERS = [
    "RGB_SHIFT",
    "PIXELATE",
    "BACKGROUND",
    "EDGE_DETECTION",
    "COLOR_OVERLAY",
    "NOISE",
    "BRIGHTNESS",
    "BLUR",
    "GAUSSIAN_BLUR",
    "CONTRAST",
    "GRAYSCALE",
    "NEGATIVE",
];

const FilterPanels = {
    BACKGROUND: BackgroundPanel,
    RGB_SHIFT: RGBShiftPanel,
    PIXELATE: PixelatePanel,
    EDGE_DETECTION: EdgeDetectionPanel,
    COLOR_OVERLAY: ColorOverlayPanel,
    NOISE: NoisePanel,
    BRIGHTNESS: BrightnessPanel,
    BLUR: BlurPanel,
    GAUSSIAN_BLUR: GaussianBlurPanel,
    CONTRAST: ContrastPanel,
    GRAYSCALE: GrayscalePanel,
    NEGATIVE: NegativePanel
};

const defaultParamsByFilter = {
    rgb_shift: {
        redDx: 0,
        redDy: 0,
        greenDx: 0,
        greenDy: 0,
        blueDx: 0,
        blueDy: 0,
    },
    color_overlay: {
        red: 0,
        green: 0,
        blue: 0,
        alpha: 0.5,
    },
    pixelate: {
        blockSize: 10,
    },
    noise: {
        mean: 0,
        stddev: 0
    },
    background:{
        red: 0,
        green: 0,
        blue: 0,
        threshold: 5.0,
    },
    edge_detection: {
        threshold1: 50.0,
        threshold2: 150.0
    },
    brightness: {
        brightness: 0,
    },
    blur: {
        kernelSize: 5
    },
    gaussian_blur: {
        kernelSize: 5
    },
    contrast:{
        alpha: 1.0
    }
};

export default function HomePage() {
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [filterParams, setFilterParams] = useState(defaultParamsByFilter);
    const [processedBlob, setProcessedBlob] = useState(null);
    const { user } = useUser();
    const [colorPickerMode, setColorPickerMode] = useState(false);
    const colorPickHandlerRef = useRef(null);

    async function applyFilter(filterName, params) {
        if (!imageFile && !processedBlob) {
            alert('Load image file first');
            return;
        }

        const fileToSend = processedBlob
            ? new File([processedBlob], 'filtered.png', { type: processedBlob.type })
            : imageFile;

        try {
            const blob = await sendFilterRequest(fileToSend, filterName, params);
            setProcessedBlob(blob);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(blob);

        } catch (e) {
            alert('Error applying filter: ' + e.message);
        }
    }

    const handleColorPickerToggle = (active, handler) => {
        console.log('handleColorPickerToggle called:', { active, handler: !!handler });
        setColorPickerMode(active);
        colorPickHandlerRef.current = handler;
    };

    const handleColorPick = (color) => {
        const handler = colorPickHandlerRef.current;
        console.log('handleColorPick called:', {
            color,
            handler: !!handler,
            colorPickerMode
        });

        if (!color) {
            console.warn('No color provided');
            return;
        }

        if (!handler) {
            console.warn('No colorPickHandler available');
            return;
        }

        try {
            handler(color);
            setColorPickerMode(false);
        } catch (error) {
            console.error('Error calling colorPickHandler:', error);
        }
    };

    useEffect(() => {
        if (location.state?.imageUrl) {
            const url = location.state.imageUrl;
            setImage(url);

            fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "uploaded_image.png", { type: blob.type });
                    setImageFile(file);
                })
                .catch(err => {
                    console.error("Failed to load image from URL", err);
                });
        }
    }, [location.state]);

    useEffect(() => {
        if (activeFilter) {
            const key = activeFilter.toLowerCase();
            if (!(key in filterParams)) {
                if (defaultParamsByFilter[key]) {
                    setFilterParams(prev => ({
                        ...prev,
                        [key]: defaultParamsByFilter[key],
                    }));
                } else {
                    setFilterParams(prev => ({
                        ...prev,
                        [key]: {},
                    }));
                }
            }
        }
    }, [activeFilter, filterParams]);

    const ActiveFilterPanel = activeFilter ? FilterPanels[activeFilter] : null;

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    filters={FILTERS}
                />

                <main className="flex-1 flex justify-center p-4 overflow-hidden bg-blue-50">
                    <ImageUploader
                        onImageLoad={(dataUrl) => setImage(dataUrl)}
                        onFileLoad={(file) => setImageFile(file)}
                        image={image}
                        onRemove={() => {
                            setImage(null);
                            setImageFile(null);
                            setProcessedBlob(null);
                            setColorPickerMode(false);
                        }}
                        processedBlob={processedBlob}
                        onResetBlob={() => setProcessedBlob(null)}
                        userId={user?.uid}
                        colorPickerMode={colorPickerMode}
                        onColorPick={handleColorPick}
                        showColorPickerHint={colorPickerMode}
                    />
                </main>

                {ActiveFilterPanel && (
                    <div
                        className="absolute left-64 top-0 h-full w-[380px] bg-white border-l border-blue-200 shadow-lg z-10 overflow-auto flex flex-col">
                        <div className="flex-grow overflow-auto">
                            <ActiveFilterPanel
                                params={filterParams[activeFilter.toLowerCase()] || {}}
                                setParams={(newParams) =>
                                    setFilterParams((prev) => ({
                                        ...prev,
                                        [activeFilter.toLowerCase()]: newParams,
                                    }))
                                }
                                imageSrc={image}
                                onColorPickerToggle={handleColorPickerToggle}
                                colorPickerActive={colorPickerMode}
                            />
                        </div>

                        <div className="p-4 border-t border-blue-200 bg-gray-50">
                            <button
                                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                onClick={() => {
                                    applyFilter(activeFilter, filterParams[activeFilter.toLowerCase()]);
                                }}
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}