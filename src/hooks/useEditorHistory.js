import { useCallback, useMemo, useState } from "react";

const MAX_HISTORY = 25;

function nowTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function buildOperationMeta(meta = {}) {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        category: meta.category || "UNKNOWN",
        tool: meta.tool || null,
        params: meta.params || {},
        title: meta.title || "Operation",
        subtitle: meta.subtitle || "",
        time: nowTime(),
        createdAt: Date.now(),
        status: meta.status || "OK",
    };
}

function buildStateSnapshot({ image, imageFile, processedBlob, operation }) {
    return {
        image,
        imageFile,
        processedBlob,
        operation: buildOperationMeta(operation),
    };
}

export default function useEditorHistory() {
    const [past, setPast] = useState([]);
    const [present, setPresent] = useState(null);
    const [future, setFuture] = useState([]);

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    const initializeHistory = useCallback((payload) => {
        const initial = buildStateSnapshot({
            ...payload,
            operation: {
                category: "SYSTEM",
                tool: "IMAGE_LOADED",
                params: {},
                title: "Image loaded",
                subtitle: payload?.imageFile?.name || "Initial state",
                status: "OK",
            },
        });

        setPast([]);
        setPresent(initial);
        setFuture([]);
    }, []);

    const pushState = useCallback((payload) => {
        const nextState = buildStateSnapshot(payload);

        setPast((prev) => {
            if (!present) return [];
            const nextPast = [...prev, present];
            return nextPast.length > MAX_HISTORY
                ? nextPast.slice(nextPast.length - MAX_HISTORY)
                : nextPast;
        });

        setPresent(nextState);
        setFuture([]);
    }, [present]);

    const undo = useCallback(() => {
        if (!past.length || !present) return null;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);

        setPast(newPast);
        setFuture((prev) => [present, ...prev]);
        setPresent(previous);

        return previous;
    }, [past, present]);

    const redo = useCallback(() => {
        if (!future.length || !present) return null;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast((prev) => {
            const nextPast = [...prev, present];
            return nextPast.length > MAX_HISTORY
                ? nextPast.slice(nextPast.length - MAX_HISTORY)
                : nextPast;
        });

        setFuture(newFuture);
        setPresent(next);

        return next;
    }, [future, present]);

    const clearHistory = useCallback(() => {
        setPast([]);
        setFuture([]);
    }, []);

    const historyItems = useMemo(() => {
        const items = [
            ...past.map((x) => x.operation),
            ...(present ? [present.operation] : []),
            ...future.map((x) => ({
                ...x.operation,
                status: "UNDONE",
            })),
        ];

        return items.sort((a, b) => a.createdAt - b.createdAt);
    }, [past, present, future]);

    const persistedOperations = useMemo(() => {
        return historyItems
            .filter((item) => item.category !== "SYSTEM")
            .map((item, index) => ({
                order: index + 1,
                category: item.category,
                tool: item.tool || null,
                params: item.params || {},
            }));
    }, [historyItems]);

    const loadHistoryFromOperations = useCallback((baseSnapshot, operations = []) => {
        const initial = buildStateSnapshot({
            image: baseSnapshot.image,
            imageFile: baseSnapshot.imageFile,
            processedBlob: baseSnapshot.processedBlob ?? null,
            operation: {
                category: "SYSTEM",
                tool: "IMAGE_LOADED",
                params: {},
                title: "Image loaded",
                subtitle: baseSnapshot?.imageFile?.name || "Initial state",
                status: "OK",
            },
        });

        const nextPast = [];
        let current = initial;

        for (const op of operations) {
            nextPast.push(current);

            current = buildStateSnapshot({
                image: op.snapshotImage,
                imageFile: op.snapshotFile,
                processedBlob: op.snapshotBlob ?? null,
                operation: {
                    category: op.category || "UNKNOWN",
                    tool: op.tool || null,
                    params: op.params || {},
                    title: (op.tool || "Operation").replace(/_/g, " "),
                    subtitle:
                        op.tool === "MANUAL_BATCH"
                            ? `${op.params?.actionsCount || op.params?.actions?.length || 0} actions`
                            : Object.entries(op.params || {})
                                .filter(([key]) => key !== "actions")
                                .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
                                .join(", "),
                    status: "OK",
                },
            });
        }

        setPast(nextPast);
        setPresent(current);
        setFuture([]);
    }, []);

    return {
        past,
        present,
        future,
        canUndo,
        canRedo,
        historyItems,
        persistedOperations,
        initializeHistory,
        pushState,
        undo,
        redo,
        clearHistory,
        loadHistoryFromOperations
    };
}