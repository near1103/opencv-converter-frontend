import React, { useState, useEffect, useCallback, useMemo } from "react";
import ImageDropZone from "./ImageDropZone";
import ImageEditorCanvas from "./ImageEditorCanvas";
import FormatSelector from "./FormatSelector";
import ImageActions from "./ImageActions";
import Toast from "../ui-elements/Toast";
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
                                          userId,
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
    const [isConverting, setIsConverting] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "", visible: false });

    const supportedFormats = useMemo(
        () => ["png", "jpeg", "jpg", "webp", "gif", "bmp"],
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
            reader.onload = () => setImageSrc(reader.result);
            reader.readAsDataURL(processedBlob);
        }
    }, [processedBlob]);

    useEffect(() => {
        const loadFormats = async () => {
            const data = await fetchFormats();
            setFormatOptions(data);
            setSelectedFormat(data[0]?.value || "");
            setLoadingFormats(false);
        };

        loadFormats();
    }, []);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile);

        const extMatch = uploadedFile.name.match(/\.(\w+)$/);
        const extension = extMatch ? extMatch[1].toLowerCase() : "";

        const reader = new FileReader();

        const handleImage = (result) => {
            setImageSrc(result);
            setOriginalImageSrc(result);
            onImageLoad?.(result);
            onFileLoad?.(uploadedFile);
        };

        if (!supportedFormats.includes(extension)) {
            try {
                const blob = await convertToFormat(uploadedFile, "png");
                reader.onload = () => handleImage(reader.result);
                reader.readAsDataURL(blob);
            } catch (err) {
                console.error("Preview conversion error:", err);
                alert("Preview failed. Try another file.");
            }
        } else {
            reader.onload = () => handleImage(reader.result);
            reader.readAsDataURL(uploadedFile);
        }
    }, [onImageLoad, onFileLoad, supportedFormats]);

    const handleRemove = () => {
        setImageSrc(null);
        setOriginalImageSrc(null);
        setFile(null);
        setSelectedFormat(formatOptions[0]?.value || "");
        onImageLoad?.(null);
        onRemove?.();
    };

    const handleReset = () => {
        if (originalImageSrc) {
            setImageSrc(originalImageSrc);
            onImageLoad?.(originalImageSrc);
            onResetBlob?.();
        }
    };

    const handleSave = async () => {
        if (!selectedFormat) return;

        const blobToSend = processedBlob || file;
        if (!blobToSend) {
            alert("No image to save.");
            return;
        }

        setIsConverting(true);

        const format = formatOptions.find((f) => f.value === selectedFormat);
        const mimeType = format?.mimeType || `image/${selectedFormat}`;
        const fileName = file ? file.name : `image.${selectedFormat}`;
        const fileToSend = new File([blobToSend], fileName, { type: mimeType });

        try {
            const blob = await convertToFormat(fileToSend, selectedFormat);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `converted.${selectedFormat}`;
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save image.");
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

            showToast("Project saved successfully!", "success");
        } catch (err) {
            console.error("Save project error:", err);
            showToast(`Failed to save project: ${err.message}`, "error");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full px-4 max-w-5xl mx-auto">
            {toast.visible && (
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}

            <ImageDropZone onDrop={onDrop} imageSrc={!!imageSrc} />

            <ImageEditorCanvas
                imageSrc={imageSrc}
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