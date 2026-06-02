import React, { useEffect, useState, useRef } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import ImageUploader from "../image-uploader/ImageUploader";
import { useUser } from "../../UserContext";
import { useLocation } from "react-router-dom";
import { useGlobalLoading } from "../../loading/LoadingContext";
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
import {
    sendFilterRequest,
    getAuthToken,
    transformImage,
    sendManualEditRequest,
    rebuildProjectFromBase
} from "../../api";
import Toast from "../ui-elements/Toast";
import BrushPanel from "../manual-panels/BrushPanel";
import EraserPanel from "../manual-panels/EraserPanel";
import SelectPanel from "../manual-panels/SelectPanel";
import ColorFillPanel from "../manual-panels/ColorFillPanel";
import HistoryViewPanel from "../history-panels/HistoryViewPanel";
import UndoPanel from "../history-panels/UndoPanel";
import RedoPanel from "../history-panels/RedoPanel";
import useEditorHistory from "../../hooks/useEditorHistory";
import ObamifyPanel from "../filter-panels/ObamifyPanel";

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
    "ASCII_ART",
    "OBAMIFY",
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
    ASCII_ART: ASCIIGradientPanel,
    OBAMIFY: ObamifyPanel,
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
    chromatic_aberration: {
        redStrength: 5.0,
        greenStrength: 5.0,
        blueStrength: 5.0,
        radialStrength: 2.0,
    },
    data_mosh: { blockSize: 16, maxOffset: 30, chaos: 0.5, smear: 0.7 },
    ascii_art: { blockSize: 6, gradient: ".:-=+*#%@", invert: false },
    obamify: {  preset: "obama", resolution: 96, proximityImportance: 4}
};

const defaultManualParams = {
    BRUSH: {
        color: "#000000",
        size: 12,
        opacity: 0.8,
    },
    ERASER: {
        size: 24,
        opacity: 1.0,
    },
    COLOR_FILL: {
        color: "#000000",
        tolerance: 20,
    },
    SELECT: {
        mode: "RECTANGLE",
        feather: 0,
    },
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
    const { withLoading } = useGlobalLoading();

    const [colorPickerMode, setColorPickerMode] = useState(false);
    const colorPickHandlerRef = useRef(null);

    const TRANSFORM_TOOLS = ["ROTATE", "FLIP", "CROP", "RESIZE"];
    const MANUAL_TOOLS = ["BRUSH", "ERASER", "SELECT", "COLOR_FILL"];
    const HISTORY_TOOLS = ["VIEW_HISTORY", "UNDO", "REDO"];

    const ActiveFilterPanel = activeFilter ? FilterPanels[activeFilter] : null;

    const [manualParams, setManualParams] = useState(defaultManualParams);

    const {
        canUndo,
        canRedo,
        historyItems,
        persistedOperations,
        initializeHistory,
        pushState,
        undo,
        redo,
        clearHistory,
        loadHistoryFromOperations,
    } = useEditorHistory();

    const getCurrentFile = () => {
        if (processedBlob) {
            return new File([processedBlob], "edited.png", {
                type: processedBlob.type || "image/png",
            });
        }
        return imageFile;
    };

    const handleFileLoaded = (file, dataUrl) => {
        setImage(dataUrl);
        setImageFile(file);
        setProcessedBlob(null);

        initializeHistory({
            image: dataUrl,
            imageFile: file,
            processedBlob: null,
        });
    };

    const buildPersistedOperations = () => {
        return persistedOperations;
    };

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

    const restoreSnapshot = (snapshot) => {
        if (!snapshot) return;

        setImage(snapshot.image || null);
        setImageFile(snapshot.imageFile || null);
        setProcessedBlob(snapshot.processedBlob || null);
    };

    const handleUndo = () => {
        const snapshot = undo();
        if (!snapshot) {
            setToast({ message: "Nothing to undo", type: "error" });
            return;
        }
        restoreSnapshot(snapshot);
    };

    const handleRedo = () => {
        const snapshot = redo();
        if (!snapshot) {
            setToast({ message: "Nothing to redo", type: "error" });
            return;
        }
        restoreSnapshot(snapshot);
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImageFile(null);
        setProcessedBlob(null);
        clearHistory();
    };

    const getFileExtensionFromMime = (mimeType) => {
        if (!mimeType) return "png";

        if (mimeType.includes("gif")) return "gif";
        if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
        if (mimeType.includes("webp")) return "webp";
        if (mimeType.includes("bmp")) return "bmp";
        if (mimeType.includes("tiff")) return "tiff";

        return "png";
    };

    async function applyFilter(filterName, params) {
        if (!imageFile && !processedBlob) {
            setToast({ message: "Load image file first", type: "error" });
            return;
        }

        const fileToSend = processedBlob
            ? new File(
                [processedBlob],
                `filtered.${getFileExtensionFromMime(processedBlob.type)}`,
                { type: processedBlob.type || "image/png" }
            )
            : imageFile;

        try {
            await withLoading(async () => {
                const blob = await sendFilterRequest(fileToSend, filterName, params);

                setProcessedBlob(blob);

                const reader = new FileReader();
                reader.onloadend = () => {
                    const nextImage = reader.result;
                    setImage(nextImage);

                    pushState({
                        image: nextImage,
                        imageFile: fileToSend,
                        processedBlob: blob,
                        operation: {
                            category: "FILTER",
                            tool: filterName,
                            params: params || {},
                            title: filterName.replace(/_/g, " "),
                            subtitle: Object.entries(params || {})
                                .map(([k, v]) => `${k}=${v}`)
                                .join(", "),
                        },
                    });
                };
                reader.readAsDataURL(blob);
            }, "Applying filter...");
        } catch (e) {
            setToast({ message: "Error applying filter: " + e.message, type: "error" });
        }
    }

    async function applyTransformation(type, params) {
        if (!imageFile && !processedBlob) {
            setToast({ message: "Load image file first", type: "error" });
            return;
        }

        const fileToSend = processedBlob
            ? new File([processedBlob], "transformed.png", { type: processedBlob.type })
            : imageFile;

        try {
            await withLoading(async () => {
                const blob = await transformImage(fileToSend, type, params);

                setProcessedBlob(blob);

                const reader = new FileReader();
                reader.onloadend = () => {
                    const nextImage = reader.result;
                    setImage(nextImage);

                    pushState({
                        image: nextImage,
                        imageFile: fileToSend,
                        processedBlob: blob,
                        operation: {
                            category: "TRANSFORM",
                            tool: type,
                            params: params || {},
                            title: type.replace(/_/g, " "),
                            subtitle: Object.entries(params || {})
                                .map(([k, v]) => `${k}=${v}`)
                                .join(", "),
                        },
                    });
                };
                reader.readAsDataURL(blob);
            }, "Applying transformation...");
        } catch (e) {
            setToast({
                message: "Error applying transformation: " + e.message,
                type: "error",
            });
        }
    }

    async function applyManualEdit(action) {
        const fileToSend = getCurrentFile();

        if (!fileToSend) {
            setToast({ message: "Load image file first", type: "error" });
            return;
        }

        try {
            await withLoading(async () => {
                const payload = { ...action };
                delete payload.type;

                if (Array.isArray(payload.points)) {
                    payload.points = JSON.stringify(payload.points);
                }

                const blob = await sendManualEditRequest(fileToSend, action.type, payload);

                setProcessedBlob(blob);

                const reader = new FileReader();
                reader.onloadend = () => {
                    const nextImage = reader.result;

                    setImage(nextImage);

                    pushState({
                        image: nextImage,
                        imageFile: fileToSend,
                        processedBlob: blob,
                        operation: {
                            category: "MANUAL",
                            tool: action.type,
                            params: payload || {},
                            title: action.type.replace(/_/g, " "),
                            subtitle: Object.entries(payload || {})
                                .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
                                .join(", "),
                        },
                    });
                };
                reader.readAsDataURL(blob);
            }, "Applying edit...");
        } catch (e) {
            setToast({
                message: "Error applying manual edit: " + e.message,
                type: "error",
            });
        }
    }

    async function applyManualEditBatch(actions) {
        let currentFile = getCurrentFile();

        if (!currentFile) {
            setToast({ message: "Load image file first", type: "error" });
            return;
        }

        try {
            await withLoading(async () => {
                let latestBlob = null;

                for (const action of actions) {
                    const payload = { ...action };
                    delete payload.type;

                    if (Array.isArray(payload.points)) {
                        payload.points = JSON.stringify(payload.points);
                    }

                    latestBlob = await sendManualEditRequest(currentFile, action.type, payload);

                    currentFile = new File([latestBlob], "edited-step.png", {
                        type: latestBlob.type || "image/png",
                    });
                }

                if (!latestBlob) return;

                setProcessedBlob(latestBlob);

                const reader = new FileReader();
                reader.onloadend = () => {
                    const nextImage = reader.result;

                    setImage(nextImage);

                    pushState({
                        image: nextImage,
                        imageFile: currentFile,
                        processedBlob: latestBlob,
                        operation: {
                            category: "MANUAL",
                            tool: "MANUAL_BATCH",
                            params: {
                                actions: actions.map((action) => {
                                    const normalized = { ...action };

                                    if (Array.isArray(normalized.points)) {
                                        normalized.points = normalized.points.map((p) => ({
                                            x: p.x,
                                            y: p.y,
                                        }));
                                    }

                                    return normalized;
                                }),
                                actionsCount: actions.length,
                            },
                            title: "Batch manual edit",
                            subtitle: `${actions.length} actions`,
                        },
                    });
                };
                reader.readAsDataURL(latestBlob);
            }, "Applying edits...");
        } catch (e) {
            setToast({
                message: "Error applying manual edits: " + e.message,
                type: "error",
            });
        }
    }

    async function applyImageCrop(blob) {
        const currentFile = getCurrentFile();

        setProcessedBlob(blob);

        const reader = new FileReader();
        reader.onloadend = () => {
            const nextImage = reader.result;

            setImage(nextImage);

            pushState({
                image: nextImage,
                imageFile: currentFile,
                processedBlob: blob,
                operation: {
                    category: "TRANSFORM",
                    tool: "CROP",
                    params: {},
                    title: "Crop",
                    subtitle: "Applied from editor canvas",
                },
            });
        };
        reader.readAsDataURL(blob);
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

            const commonProps = {
                applyTransformation,
            };

            const panelProps =
                activeTool === "CROP" || activeTool === "RESIZE"
                    ? { ...commonProps, imageSrc: image }
                    : commonProps;

            return {
                title: `Transformations • ${activeTool.replace(/_/g, " ")}`,
                body: Panel ? <Panel {...panelProps} /> : <div>Tool not found</div>,
            };
        }

        if (activeMenu === "manualEdit" && activeTool) {
            const Panel = ManualPanels[activeTool];

            return {
                title: `Manual Editing • ${activeTool.replace(/_/g, " ")}`,
                body: Panel ? (
                    <Panel
                        value={manualParams[activeTool]}
                        onChange={(patch) =>
                            setManualParams((prev) => ({
                                ...prev,
                                [activeTool]: {
                                    ...prev[activeTool],
                                    ...patch,
                                },
                            }))
                        }
                    />
                ) : (
                    <div>Tool not found</div>
                ),
            };
        }

        if (activeMenu === "history" && activeTool) {
            const Panel = HistoryPanels[activeTool];

            const sharedProps = {
                canUndo,
                canRedo,
                onUndo: handleUndo,
                onRedo: handleRedo,
                onClear: clearHistory,
                items: historyItems,
            };

            return {
                title: `History • ${activeTool.replace(/_/g, " ")}`,
                body: Panel ? <Panel {...sharedProps} /> : <div>Tool not found</div>,
            };
        }

        return null;
    };

    const sidePanel = getActiveSidePanel();

    useEffect(() => {
        const state = location.state;
        if (!state) return;

        if (state.projectId) {
            const projectId = state.projectId;

            (async () => {
                try {
                    await withLoading(async () => {
                        const token = getAuthToken();
                        if (!token) throw new Error("Not authenticated");

                        const detailsRes = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!detailsRes.ok) throw new Error(await detailsRes.text());

                        const details = await detailsRes.json();
                        const operations = details?.operations || [];

                        const baseRes = await fetch(
                            `/api/projects/${encodeURIComponent(projectId)}/base-image`,
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        );
                        if (!baseRes.ok) throw new Error(await baseRes.text());

                        const baseBlob = await baseRes.blob();
                        const baseFile = new File([baseBlob], "project_base.png", {
                            type: baseBlob.type || "image/png",
                        });

                        const baseImageDataUrl = await new Promise((resolve) => {
                            const baseReader = new FileReader();
                            baseReader.onloadend = () => resolve(baseReader.result);
                            baseReader.readAsDataURL(baseBlob);
                        });

                        if (!operations.length) {
                            setImage(baseImageDataUrl);
                            setImageFile(baseFile);
                            setProcessedBlob(null);

                            initializeHistory({
                                image: baseImageDataUrl,
                                imageFile: baseFile,
                                processedBlob: null,
                            });
                            return;
                        }

                        let currentFile = baseFile;
                        const rebuiltSteps = [];

                        for (const op of operations) {
                            const rebuiltFile = await rebuildProjectFromBase(currentFile, [op]);

                            const stepBlob = rebuiltFile;
                            const stepFile = rebuiltFile;

                            const stepDataUrl = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(stepBlob);
                            });

                            rebuiltSteps.push({
                                category: op.category,
                                tool: op.tool,
                                params: op.params || {},
                                snapshotImage: stepDataUrl,
                                snapshotFile: stepFile,
                                snapshotBlob: stepBlob,
                            });

                            currentFile = rebuiltFile;
                        }

                        const finalStep = rebuiltSteps[rebuiltSteps.length - 1];

                        setImage(finalStep.snapshotImage);
                        setImageFile(baseFile);
                        setProcessedBlob(finalStep.snapshotBlob);

                        loadHistoryFromOperations(
                            {
                                image: baseImageDataUrl,
                                imageFile: baseFile,
                                processedBlob: null,
                            },
                            rebuiltSteps
                        );
                    }, "Loading project...");
                } catch (err) {
                    setToast({ message: "Failed to load project", type: "error" });
                    console.error("Failed to load project", err);
                }
            })();

            return;
        }

        if (state.imageId) {
            const id = state.imageId;

            (async () => {
                try {
                    await withLoading(async () => {
                        const token = getAuthToken();
                        if (!token) throw new Error("Not authenticated");

                        const res = await fetch(`/api/images/${encodeURIComponent(id)}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) throw new Error(await res.text());

                        const blob = await res.blob();
                        const dataUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });

                        const file = new File([blob], "saved_image.png", { type: blob.type });

                        setImage(dataUrl);
                        setImageFile(file);
                        setProcessedBlob(null);

                        initializeHistory({
                            image: dataUrl,
                            imageFile: file,
                            processedBlob: null,
                        });
                    }, "Loading image...");
                } catch (err) {
                    setToast({ message: "Failed to load image", type: "error" });
                    console.error("Failed to load image by id", err);
                }
            })();

            return;
        }

        if (state.imageUrl) {
            const url = state.imageUrl;

            (async () => {
                try {
                    await withLoading(async () => {
                        const res = await fetch(url);
                        if (!res.ok) throw new Error("Failed to fetch image");

                        const blob = await res.blob();
                        const dataUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });

                        const file = new File([blob], "uploaded_image.png", { type: blob.type });

                        setImage(dataUrl);
                        setImageFile(file);
                        setProcessedBlob(null);

                        initializeHistory({
                            image: dataUrl,
                            imageFile: file,
                            processedBlob: null,
                        });
                    }, "Loading image...");
                } catch (err) {
                    setToast({ message: "Failed to load image", type: "error" });
                    console.error("Failed to load image from URL", err);
                }
            })();
        }
    }, [location.state, initializeHistory, loadHistoryFromOperations, withLoading]);

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

                <ImageUploader
                    onImageLoad={(dataUrl) => {
                        setImage(dataUrl);
                    }}
                    onFileLoad={(file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const dataUrl = reader.result;
                            handleFileLoaded(file, dataUrl);
                        };
                        reader.readAsDataURL(file);
                    }}
                    image={image}
                    onRemove={handleRemoveImage}
                    processedBlob={processedBlob}
                    onResetBlob={() => setProcessedBlob(null)}
                    userId={user?.uid}
                    manualTool={activeMenu === "manualEdit" ? activeTool : null}
                    manualConfig={activeTool ? manualParams[activeTool] : null}
                    onManualApplyBatch={applyManualEditBatch}
                    onImageCropApply={applyImageCrop}
                    colorPickerActive={colorPickerMode}
                    onColorPick={handleColorPick}
                    originalFile={imageFile}
                    currentFile={getCurrentFile()}
                    persistedOperations={persistedOperations}
                />

                {sidePanel && (
                    <SidePanelShell title={sidePanel.title} footer={sidePanel.footer}>
                        {sidePanel.body}
                    </SidePanelShell>
                )}
            </div>

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