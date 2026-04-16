import React, { useEffect, useState, useRef } from 'react';
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
import ChromaticAberrationPanel from "../filter-panels/ChromaticAberrationPanel";
import DataMoshPanel from "../filter-panels/DataMoshPanel";
import ASCIIGradientPanel from "../filter-panels/ASCIIGradientPanel";
import SidePanelShell from "../ui-elements/SidePanelShell";
import RotatePanel from "../transformations-panel/RotatePanel";
import FlipPanel from "../transformations-panel/FlipPanel";
import CropPanel from "../transformations-panel/CropPanel";
import ResizePanel from "../transformations-panel/ResizePanel";
import { sendFilterRequest, getAuthToken } from "../../api";
import Toast from "../ui-elements/Toast"
import BrushPanel from "../manual-panels/BrushPanel";
import EraserPanel from "../manual-panels/EraserPanel";
import SelectPanel from "../manual-panels/SelectPanel";
import ColorFillPanel from "../manual-panels/ColorFillPanel";
import HistoryViewPanel from "../history-panels/HistoryViewPanel";
import UndoPanel from "../history-panels/UndoPanel";
import RedoPanel from "../history-panels/RedoPanel";

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
    "CHROMATIC_ABERRATION",
    "DATA_MOSH",
    "ASCII_ART"
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
    NEGATIVE: NegativePanel,
    CHROMATIC_ABERRATION: ChromaticAberrationPanel,
    DATA_MOSH: DataMoshPanel,
    ASCII_ART: ASCIIGradientPanel
};

const defaultParamsByFilter = {
    rgb_shift: { redDx: 0, redDy: 0, greenDx: 0, greenDy: 0, blueDx: 0, blueDy: 0 },
    color_overlay: { red: 0, green: 0, blue: 0, alpha: 0.5 },
    pixelate: { blockSize: 10 },
    noise: { mean: 0, stddev: 0 },
    background: { red: 0, green: 0, blue: 0, threshold: 5.0 },
    edge_detection: { threshold1: 50.0, threshold2: 150.0 },
    brightness: { brightness: 0 },
    blur: { kernelSize: 5 },
    gaussian_blur: { kernelSize: 5 },
    contrast: { alpha: 1.0 },
    chromatic_aberration: { redStrength: 5.0, greenStrength: 5.0, blueStrength: 5.0, radialStrength: 2.0 },
    data_mosh: { blockSize: 16, maxOffset: 30, chaos: 0.5, smear: 0.7 },
    ascii_art: { blockSize: 6, gradient: ".:-=+*#%@", invert: false }
};

const TransformPanels = {
    ROTATE: RotatePanel,
    FLIP: FlipPanel,
    CROP: CropPanel,
    RESIZE: ResizePanel,
};

const ManualPanels = {
    BRUSH: BrushPanel,
    ERASER: EraserPanel,
    SELECT: SelectPanel,
    COLOR_FILL: ColorFillPanel,
};

const HistoryPanels = {
    VIEW_HISTORY: HistoryViewPanel,
    UNDO: UndoPanel,
    REDO: RedoPanel,
};

export default function HomePage() {
    const location = useLocation();

    const [activeMenu, setActiveMenu] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);
    const [activeTool, setActiveTool] = useState(null);

    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [processedBlob, setProcessedBlob] = useState(null);

    const [filterParams, setFilterParams] = useState(defaultParamsByFilter);
    const [toast, setToast] = useState(null);

    const { user } = useUser();

    const [colorPickerMode, setColorPickerMode] = useState(false);
    const colorPickHandlerRef = useRef(null);

    const TRANSFORM_TOOLS = ["ROTATE", "FLIP", "CROP", "RESIZE"];
    const MANUAL_TOOLS = ["BRUSH", "ERASER", "SELECT", "COLOR_FILL"];
    const HISTORY_TOOLS = ["VIEW_HISTORY", "UNDO", "REDO"];

    const ActiveFilterPanel = activeFilter ? FilterPanels[activeFilter] : null;

    const handleColorPickerToggle = (active, handler) => {
        setColorPickerMode(active);
        colorPickHandlerRef.current = handler;
    };

    const handleColorPick = (color) => {
        const handler = colorPickHandlerRef.current;
        if (!color || !handler) return;

        try {
            handler(color);
            setColorPickerMode(false);
        } catch (error) {
            console.error("Error calling colorPickHandler:", error);
        }
    };

    const resetActiveFilter = () => {
        if (!activeFilter) return;
        const key = activeFilter.toLowerCase();
        const defaults = defaultParamsByFilter[key];
        setFilterParams((prev) => ({
            ...prev,
            [key]: defaults ? { ...defaults } : {},
        }));
    };

    async function applyFilter(filterName, params) {
        if (!imageFile && !processedBlob) {
            setToast({ message: "Load image file first", type: "error" });
            return;
        }

        const fileToSend = processedBlob
            ? new File([processedBlob], "filtered.png", { type: processedBlob.type })
            : imageFile;

        try {
            const blob = await sendFilterRequest(fileToSend, filterName, params);
            setProcessedBlob(blob);

            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(blob);
        } catch (e) {
            setToast({ message: "Error applying filter: " + e.message, type: "error" });
        }
    }

    const getActiveSidePanel = () => {
        if (activeMenu === "filters" && ActiveFilterPanel) {
            return {
                title: `Filters • ${activeFilter.replace(/_/g, " ")}`,
                body: (
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
                ),
                footer: (
                    <div className="space-y-2">
                        <button
                            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() =>
                                applyFilter(activeFilter, filterParams[activeFilter.toLowerCase()])
                            }
                        >
                            Apply Filter
                        </button>
                        <button
                            className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            onClick={resetActiveFilter}
                        >
                            Reset to Default
                        </button>
                    </div>
                ),
            };
        }

        if (activeMenu === "transformations" && activeTool) {
            const Panel = TransformPanels[activeTool];
            return {
                title: `Transformations • ${activeTool.replace(/_/g, " ")}`,
                body: Panel ? <Panel /> : <div className="p-4">Tool not found</div>,
            };
        }

        if (activeMenu === "manualEdit" && activeTool) {
            const Panel = ManualPanels[activeTool];
            return {
                title: `Manual Editing • ${activeTool.replace(/_/g, " ")}`,
                body: Panel ? <Panel /> : <div className="p-4">Tool not found</div>,
            };
        }

        if (activeMenu === "history" && activeTool) {
            const Panel = HistoryPanels[activeTool];
            return {
                title: `History • ${activeTool.replace(/_/g, " ")}`,
                body: Panel ? <Panel /> : <div className="p-4">Tool not found</div>,
            };
        }

        return null;
    };

    const sidePanel = getActiveSidePanel();

    useEffect(() => {
        const state = location.state;
        if (!state) return;

        if (state.imageId) {
            const id = state.imageId;
            (async () => {
                try {
                    const token = getAuthToken();
                    if (!token) throw new Error("Not authenticated");

                    const res = await fetch(`/api/images/${encodeURIComponent(id)}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error(await res.text());

                    const blob = await res.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    setImage(objectUrl);

                    const file = new File([blob], "saved_image.png", { type: blob.type });
                    setImageFile(file);
                    setProcessedBlob(null);
                } catch (err) {
                    setToast({ message: "Failed to load image", type: "error" });
                    console.error("Failed to load image by id", err);
                }
            })();
            return;
        }

        if (state.imageUrl) {
            const url = state.imageUrl;
            setImage(url);

            fetch(url)
                .then((res) => res.blob())
                .then((blob) => {
                    const file = new File([blob], "uploaded_image.png", { type: blob.type });
                    setImageFile(file);
                    setProcessedBlob(null);
                })
                .catch((err) => {
                    setToast({ message: "Failed to load image", type: "error" });
                    console.error("Failed to load image from URL", err);
                });
        }
    }, [location.state]);

    useEffect(() => {
        if (activeFilter) {
            const key = activeFilter.toLowerCase();
            if (!(key in filterParams)) {
                setFilterParams((prev) => ({
                    ...prev,
                    [key]: defaultParamsByFilter[key] || {},
                }));
            }
        }
    }, [activeFilter, filterParams]);

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
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    transformTools={TRANSFORM_TOOLS}
                    manualTools={MANUAL_TOOLS}
                    historyTools={HISTORY_TOOLS}
                />

                <main className="flex-1 flex justify-center p-4 overflow-hidden bg-blue-50">
                    <ImageUploader
                        onImageLoad={dataUrl => setImage(dataUrl)}
                        onFileLoad={file => setImageFile(file)}
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
                {sidePanel && (
                    <SidePanelShell title={sidePanel.title} footer={sidePanel.footer}>
                        {sidePanel.body}
                    </SidePanelShell>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}