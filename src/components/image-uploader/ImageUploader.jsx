import React, { useState, useEffect, useCallback, useMemo } from "react";
import ImageDropZone from "./ImageDropZone";
import ImageEditorCanvas from "./ImageEditorCanvas";
import FormatSelector from "./FormatSelector";
import ImageActions from "./ImageActions";
import Toast from "../ui-elements/Toast";
import { useGlobalLoading } from "../../loading/LoadingContext";
import {
    convertToFormat,
    fetchFormats,
    saveProjectToServer,
} from "../../api";

export default function ImageUploader({
                                          onImageLoad,
                                          onFileLoad,
                                          image,
                                          onRemove,
                                          processedBlob,
                                          onResetBlob,
                                          manualTool,
                                          manualConfig,
                                          onManualApplyBatch,
                                          onImageCropApply,
                                          colorPickerActive,
                                          onColorPick,
                                          originalFile,
                                          currentFile,
                                          persistedOperations,
                                      }) {
    const [imageSrc, setImageSrc] = useState(null);
    const [originalImageSrc, setOriginalImageSrc] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState("");
    const [formatOptions, setFormatOptions] = useState([]);
    const [loadingFormats, setLoadingFormats] = useState(true);
    const [file, setFile] = useState(null);
    const [isGif, setIsGif] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "", visible: false });

    const { withLoading } = useGlobalLoading();

    const supportedFormats = useMemo(
        () => ["png", "jpeg", "jpg", "webp", "gif", "bmp", "ico", "tif", "tiff", "tga", "pnm"],
        []
    );

    const showToast = (message, type = "info") => {
        setToast({ message, type, visible: true });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, visible: false }));
    };

    useEffect(() => {
        if (image) {
            setImageSrc(image);
            setOriginalImageSrc((prev) => prev || image);
        }
    }, [image]);

    useEffect(() => {
        if (processedBlob && processedBlob instanceof Blob) {
            const reader = new FileReader();

            reader.onload = () => {
                setImageSrc(reader.result);

                const processedIsGif = processedBlob.type === "image/gif";
                setIsGif(processedIsGif);
            };

            reader.readAsDataURL(processedBlob);
        }
    }, [processedBlob]);

    useEffect(() => {
        const loadFormats = async () => {
            try {
                const data = await fetchFormats();
                setFormatOptions(data);
                setSelectedFormat(data[0]?.value || "");
            } finally {
                setLoadingFormats(false);
            }
        };

        loadFormats();
    }, []);

    const onDrop = useCallback((acceptedFiles, fileRejections = []) => {
        if (fileRejections.length > 0) {
            showToast(
                `Unsupported file format. Please upload one of: ${supportedFormats.join(", ").toUpperCase()}.`,
                "error"
            );
            return;
        }

        if (!acceptedFiles || acceptedFiles.length === 0) {
            showToast(
                `Unsupported file format. Please upload one of: ${supportedFormats.join(", ").toUpperCase()}.`,
                "error"
            );
            return;
        }

        const uploadedFile = acceptedFiles[0];

        const extMatch = uploadedFile.name.match(/\.([^.]+)$/);
        const extension = extMatch ? extMatch[1].toLowerCase() : "";

        if (!supportedFormats.includes(extension)) {
            showToast(
                `Unsupported file format. Please upload one of: ${supportedFormats.join(", ").toUpperCase()}.`,
                "error"
            );
            setFile(null);
            setIsGif(false);
            return;
        }

        const isUploadedGif =
            uploadedFile.type === "image/gif" ||
            uploadedFile.name.toLowerCase().endsWith(".gif");

        const reader = new FileReader();

        reader.onload = () => {
            setImageSrc(reader.result);
            setOriginalImageSrc(reader.result);
            setFile(uploadedFile);
            setIsGif(isUploadedGif);

            onImageLoad?.(reader.result);
            onFileLoad?.(uploadedFile);
        };

        reader.onerror = () => {
            showToast("Failed to load image. Please try another file.", "error");
        };

        reader.readAsDataURL(uploadedFile);
    }, [onImageLoad, onFileLoad, supportedFormats]);

    const handleRemove = () => {
        setImageSrc(null);
        setOriginalImageSrc(null);
        setFile(null);
        setIsGif(false);
        setSelectedFormat(formatOptions[0]?.value || "");
        onImageLoad?.(null);
        onRemove?.();
    };

    const handleReset = () => {
        if (originalImageSrc) {
            setImageSrc(originalImageSrc);

            const originalIsGif =
                file?.type === "image/gif" ||
                file?.name?.toLowerCase().endsWith(".gif");

            setIsGif(!!originalIsGif);

            onImageLoad?.(originalImageSrc);
            onResetBlob?.();
        }
    };

    const handleSave = async () => {
        if (!selectedFormat) return;

        const blobToSend = processedBlob || file;
        if (!blobToSend) {
            showToast("No image to save.", "error");
            return;
        }

        setIsConverting(true);

        try {
            await withLoading(async () => {
                const format = formatOptions.find((f) => f.value === selectedFormat);
                const mimeType = format?.mimeType || `image/${selectedFormat}`;
                const fileName = file ? file.name : `image.${selectedFormat}`;
                const fileToSend = new File([blobToSend], fileName, { type: mimeType });

                const blob = await convertToFormat(fileToSend, selectedFormat);
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = `converted.${selectedFormat}`;
                a.click();
                a.remove();

                window.URL.revokeObjectURL(url);
            }, "Converting image...");
        } catch (err) {
            console.error("Save error:", err);
            showToast("Failed to save image.", "error");
        } finally {
            setIsConverting(false);
        }
    };

    const handleSaveServer = async () => {
        if (!selectedFormat) return;

        if (!originalFile || !currentFile) {
            showToast("No image data to save as project.", "error");
            return;
        }

        setIsConverting(true);

        try {
            await withLoading(async () => {
                await saveProjectToServer({
                    originalFile,
                    resultFile: currentFile,
                    projectName: originalFile?.name
                        ? originalFile.name.replace(/\.[^/.]+$/, "")
                        : "Untitled project",
                    sourceFormatId:
                        originalFile?.name?.split(".").pop()?.toLowerCase() || "png",
                    resultFormatId: selectedFormat,
                    operations: persistedOperations || [],
                });
            }, "Saving project...");

            showToast("Project saved successfully!", "success");
        } catch (err) {
            console.error("Save project error:", err);
            showToast(`Failed to save project: ${err.message}`, "error");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center w-full px-4 max-w-5xl mx-auto">
            {toast.visible && (
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}

            <ImageDropZone onDrop={onDrop} imageSrc={!!imageSrc} />

            <ImageEditorCanvas
                imageSrc={imageSrc}
                isGif={isGif}
                manualTool={manualTool}
                manualConfig={manualConfig}
                onManualApplyBatch={onManualApplyBatch}
                onImageCropApply={onImageCropApply}
                colorPickerActive={colorPickerActive}
                onColorPick={onColorPick}
            />

            {imageSrc && (
                <>
                    <FormatSelector
                        formatOptions={formatOptions}
                        selectedFormat={selectedFormat}
                        setSelectedFormat={setSelectedFormat}
                        loading={loadingFormats}
                        disabled={isConverting}
                    />
                    <ImageActions
                        onRemove={handleRemove}
                        onReset={handleReset}
                        onSave={handleSave}
                        onSaveServer={handleSaveServer}
                        canReset={!!originalImageSrc && originalImageSrc !== imageSrc}
                        isConverting={isConverting}
                        canSave={!!(file || processedBlob)}
                    />
                </>
            )}
        </div>
    );
}