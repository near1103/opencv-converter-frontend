import React, { useEffect, useMemo, useState } from "react";
import ReactCrop, {
    centerCrop,
    convertToPixelCrop,
    makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { MdCrop, MdRefresh } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

function createCenteredCrop(mediaWidth, mediaHeight, aspect) {
    if (!aspect) {
        return centerCrop(
            {
                unit: "%",
                width: 70,
                height: 70,
            },
            mediaWidth,
            mediaHeight
        );
    }

    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: 70,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export default function CropPanel({ imageSrc, applyTransformation }) {
    const [aspectPreset, setAspectPreset] = useState("FREE");
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [imgRef, setImgRef] = useState(null);
    const [loading, setLoading] = useState(false);

    const aspect = useMemo(() => {
        switch (aspectPreset) {
            case "SQUARE":
                return 1;
            case "LANDSCAPE":
                return 4 / 3;
            case "WIDE":
                return 16 / 9;
            default:
                return undefined;
        }
    }, [aspectPreset]);

    const ratioLabel = useMemo(() => {
        switch (aspectPreset) {
            case "SQUARE":
                return "1:1";
            case "LANDSCAPE":
                return "4:3";
            case "WIDE":
                return "16:9";
            default:
                return "Free";
        }
    }, [aspectPreset]);

    useEffect(() => {
        setCrop(undefined);
        setCompletedCrop(null);
        setImgRef(null);
    }, [imageSrc]);

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        setImgRef(e.currentTarget);

        const nextCrop = createCenteredCrop(width, height, aspect);
        setCrop(nextCrop);
    };

    useEffect(() => {
        if (!imgRef) return;

        const nextCrop = createCenteredCrop(imgRef.width, imgRef.height, aspect);
        setCrop(nextCrop);
        setCompletedCrop(null);
    }, [aspect, imgRef]);

    const handleReset = () => {
        if (!imgRef) return;

        const nextCrop = createCenteredCrop(imgRef.width, imgRef.height, aspect);
        setCrop(nextCrop);
        setCompletedCrop(null);
    };

    const handleApply = async () => {
        if (!imgRef || !completedCrop?.width || !completedCrop?.height) {
            alert("Please select a crop area first.");
            return;
        }

        const pixelCrop = convertToPixelCrop(
            completedCrop,
            imgRef.naturalWidth || imgRef.width,
            imgRef.naturalHeight || imgRef.height
        );

        try {
            setLoading(true);

            await applyTransformation("CROP", {
                x: String(Math.round(pixelCrop.x)),
                y: String(Math.round(pixelCrop.y)),
                width: String(Math.round(pixelCrop.width)),
                height: String(Math.round(pixelCrop.height)),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <HiOutlineInformationCircle className="text-lg mt-0.5 shrink-0" />
                <p>
                    Select the crop area directly on the preview. You can freely resize the
                    selection in Free mode or keep a fixed ratio with presets.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                    Aspect ratio
                </label>

                <div className="grid grid-cols-4 gap-2">
                    {[
                        { key: "FREE", label: "Free" },
                        { key: "SQUARE", label: "1:1" },
                        { key: "LANDSCAPE", label: "4:3" },
                        { key: "WIDE", label: "16:9" },
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setAspectPreset(item.key)}
                            className={`px-3 py-2 rounded-lg border text-sm transition ${
                                aspectPreset === item.key
                                    ? "border-blue-500 bg-blue-50 text-blue-900"
                                    : "border-blue-200 text-blue-800 hover:bg-blue-50"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-blue-100 bg-slate-100 p-2">
                <div className="flex items-center justify-center min-h-[280px] bg-slate-200 rounded-lg overflow-hidden">
                    {imageSrc ? (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            minWidth={40}
                            minHeight={40}
                            keepSelection
                        >
                            <img
                                src={imageSrc}
                                alt="Crop preview"
                                onLoad={onImageLoad}
                                className="max-h-[360px] w-auto object-contain"
                            />
                        </ReactCrop>
                    ) : (
                        <div className="text-sm text-slate-500">
                            Load an image to start cropping
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-blue-900 bg-blue-50 rounded-lg px-3 py-2">
                <MdCrop className="text-blue-600 shrink-0" />
                <span>
          {completedCrop?.width && completedCrop?.height
              ? `Selection: ${Math.round(completedCrop.width)} × ${Math.round(
                  completedCrop.height
              )} • Ratio: ${ratioLabel}`
              : `Selection: not ready • Ratio: ${ratioLabel}`}
        </span>
                {completedCrop?.width && completedCrop?.height && (
                    <FaCheckCircle className="text-green-600 ml-auto" />
                )}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={!imgRef}
                    className="flex-1 flex items-center justify-center gap-2 border border-blue-200 text-blue-800 hover:bg-blue-50 disabled:bg-slate-100 disabled:text-slate-400 font-medium py-2.5 rounded-lg transition"
                >
                    <MdRefresh />
                    Reset
                </button>

                <button
                    type="button"
                    onClick={handleApply}
                    disabled={loading || !imageSrc || !completedCrop?.width || !completedCrop?.height}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition"
                >
                    {loading ? "Applying..." : "Apply Crop"}
                </button>
            </div>
        </div>
    );
}