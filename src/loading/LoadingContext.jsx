import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const LoadingContext = createContext(null);

const SHOW_DELAY_MS = 300;
const MIN_VISIBLE_MS = 450;

export function LoadingProvider({ children }) {
    const [visibleTask, setVisibleTask] = useState(null);

    const pendingRef = useRef(new Map());

    const showLoading = useCallback((message = "Loading...") => {
        const id = `${Date.now()}-${Math.random()}`;

        const task = {
            id,
            message,
            shownAt: null,
            delayTimer: null,
            hideTimer: null,
            isVisible: false,
            cancelled: false,
        };

        task.delayTimer = setTimeout(() => {
            if (task.cancelled) return;

            task.isVisible = true;
            task.shownAt = Date.now();
            setVisibleTask({ id: task.id, message: task.message });
        }, SHOW_DELAY_MS);

        pendingRef.current.set(id, task);
        return id;
    }, []);

    const hideLoading = useCallback((id) => {
        const task = pendingRef.current.get(id);
        if (!task) return;

        task.cancelled = true;

        if (task.delayTimer) {
            clearTimeout(task.delayTimer);
            task.delayTimer = null;
        }

        if (!task.isVisible) {
            pendingRef.current.delete(id);
            return;
        }

        const visibleFor = Date.now() - task.shownAt;
        const remaining = Math.max(0, MIN_VISIBLE_MS - visibleFor);

        task.hideTimer = setTimeout(() => {
            setVisibleTask((current) => {
                if (current?.id === id) return null;
                return current;
            });

            pendingRef.current.delete(id);
        }, remaining);
    }, []);

    const withLoading = useCallback(async (fn, message = "Loading...") => {
        const id = showLoading(message);
        try {
            return await fn();
        } finally {
            hideLoading(id);
        }
    }, [showLoading, hideLoading]);

    const value = useMemo(() => ({
        isLoading: !!visibleTask,
        message: visibleTask?.message || "Loading...",
        showLoading,
        hideLoading,
        withLoading,
    }), [visibleTask, showLoading, hideLoading, withLoading]);

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useGlobalLoading() {
    const context = useContext(LoadingContext);

    if (!context) {
        throw new Error("useGlobalLoading must be used inside LoadingProvider");
    }

    return context;
}