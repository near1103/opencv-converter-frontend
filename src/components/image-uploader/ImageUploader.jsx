import React, { useState, useEffect, useCallback } from 'react';
import ImageDropZone from './ImageDropZone';
import ImagePreview from './ImagePreview';
import FormatSelector from './FormatSelector';
import ImageActions from './ImageActions';
import Toast from '../ui-elements/Toast';
import {convertToFormat, fetchFormats, saveImageToServer} from "../../api";


export default function ImageUploader({ onImageLoad, onFileLoad, image, onRemove, processedBlob, onResetBlob, userId, colorPickerMode, onColorPick, showColorPickerHint }) {
    const [imageSrc, setImageSrc] = useState(null);
    const [originalImageSrc, setOriginalImageSrc] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState('');
    const [formatOptions, setFormatOptions] = useState([]);
    const [loadingFormats, setLoadingFormats] = useState(true);
    const [file, setFile] = useState(null);
    const [originalExtension, setOriginalExtension] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '', visible: false });

    const showToast = (message, type = 'info') => {
        setToast({ message, type, visible: true });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    useEffect(() => {
        if (image) {
            setImageSrc(image);
            setOriginalImageSrc(prev => prev || image);
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
            setSelectedFormat(data[0]?.value || '');
            setLoadingFormats(false);
        };
        loadFormats();
    }, []);

    const supportedFormats = ['png', 'jpeg', 'jpg', 'webp', 'gif', 'bmp'];

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setFile(file);

        const extMatch = file.name.match(/\.(\w+)$/);
        const extension = extMatch ? extMatch[1].toLowerCase() : '';
        setOriginalExtension(extension);

        const reader = new FileReader();

        const handleImage = (result) => {
            setImageSrc(result);
            setOriginalImageSrc(result);
            onImageLoad?.(result);
            onFileLoad?.(file);
        };

        if (!supportedFormats.includes(extension)) {
            try {
                const blob = await convertToFormat(file, 'png');
                reader.onload = () => handleImage(reader.result);
                reader.readAsDataURL(blob);
            } catch (err) {
                console.error('Preview conversion error:', err);
                alert('Preview failed. Try another file.');
            }
        } else {
            reader.onload = () => handleImage(reader.result);
            reader.readAsDataURL(file);
        }
    }, [onImageLoad, onFileLoad]);

    const handleRemove = () => {
        setImageSrc(null);
        setOriginalImageSrc(null);
        setFile(null);
        setSelectedFormat(formatOptions[0]?.value || '');
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
        if (!blobToSend) return alert('No image to save.');

        setIsConverting(true);

        const format = formatOptions.find(f => f.value === selectedFormat);
        const mimeType = format?.mimeType || `image/${selectedFormat}`;
        const fileName = file ? file.name : `image.${selectedFormat}`;
        const fileToSend = new File([blobToSend], fileName, { type: mimeType });

        try {
            const blob = await convertToFormat(fileToSend, selectedFormat);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted.${selectedFormat}`;
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save image.');
        } finally {
            setIsConverting(false);
        }
    };

    const handleSaveServer = async () => {
        if (!selectedFormat) return;
        const blobToSend = processedBlob || file;
        if (!blobToSend) {
            showToast('No image to save.', 'error');
            return;
        }

        setIsConverting(true);

        try {
            await saveImageToServer(blobToSend, userId, selectedFormat);
            showToast('Image saved successfully!', 'success');
        } catch (err) {
            console.error('Save to server error:', err);
            showToast('Failed to save image on server.', 'error');
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
            <ImagePreview
                imageSrc={imageSrc}
                colorPickerMode={colorPickerMode}
                onColorPick={onColorPick}
                showColorPickerHint={showColorPickerHint}
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