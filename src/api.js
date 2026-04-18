const API = "/api";
const TOKEN_KEY = "auth_token";

export function setAuthToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
}

async function request(url, options = {}) {
    const res = await fetch(url, options);

    if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        let message = `Request failed (${res.status})`;

        try {
            if (contentType.includes("application/json")) {
                const data = await res.json();
                message = data?.message || JSON.stringify(data);
            } else {
                message = await res.text();
            }
        } catch (_) {
        }

        throw new Error(message || `Request failed (${res.status})`);
    }

    return res;
}

async function authFetch(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        throw new Error("User is not authenticated");
    }

    return request(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function fetchFormats() {
    try {
        const res = await request(`${API}/formats`);
        return await res.json();
    } catch (error) {
        console.error("fetchFormats error:", error);
        return [{ value: "png", label: "PNG", mimeType: "image/png" }];
    }
}

export async function registerRequest(email, password) {
    const res = await request(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data?.token) setAuthToken(data.token);
    return data;
}

export async function loginRequest(email, password) {
    const res = await request(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!data?.token) throw new Error("Login response does not contain token");

    setAuthToken(data.token);
    return data;
}

export async function convertToFormat(file, format) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);

    const res = await authFetch(`${API}/convert/to`, {
        method: "POST",
        body: formData,
    });

    return res.blob();
}

export async function sendFilterRequest(file, filterName, params = {}) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", filterName);

    Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
    });

    const res = await authFetch(`${API}/image/filter`, {
        method: "POST",
        body: formData,
    });

    return res.blob();
}

export async function transformImage(file, type, params = {}) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
    });

    const res = await authFetch(`${API}/image/transform`, {
        method: "POST",
        body: formData,
    });

    return res.blob();
}

export async function sendManualEditRequest(file, toolName, params = {}) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", toolName);

    Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
    });

    const res = await authFetch(`${API}/image/manual`, {
        method: "POST",
        body: formData,
    });

    return res.blob();
}

export async function saveImageToServer(blob, formatId) {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("formatId", formatId);

    const res = await authFetch(`${API}/firestore/save`, {
        method: "POST",
        body: formData,
    });

    return res.json();
}

export async function fetchUserImages() {
    const res = await authFetch(`${API}/firestore/load`);
    const data = await res.json();
    return data.images;
}

export async function deleteUserImage(id) {
    const res = await authFetch(
        `${API}/firestore/delete?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
    );

    return res.json();
}

/* =========================
   PROJECTS API
   ========================= */

export async function saveProjectToServer({
                                              originalFile,
                                              resultFile,
                                              projectName,
                                              sourceFormatId,
                                              resultFormatId,
                                              operations,
                                              projectId,
                                          }) {
    const formData = new FormData();

    formData.append("originalImage", originalFile);
    formData.append("resultImage", resultFile);
    formData.append("projectName", projectName);
    formData.append("sourceFormatId", sourceFormatId);
    formData.append("resultFormatId", resultFormatId);
    formData.append("operationsJson", JSON.stringify(operations || []));

    if (projectId) {
        formData.append("projectId", projectId);
    }

    const res = await authFetch(`${API}/projects/save`, {
        method: "POST",
        body: formData,
    });

    return res.json();
}

export async function fetchProjects() {
    const res = await authFetch(`${API}/projects`);
    return res.json();
}

export async function fetchProjectById(projectId) {
    const res = await authFetch(`${API}/projects/${encodeURIComponent(projectId)}`);
    return res.json();
}

export async function fetchProjectOperations(projectId) {
    const res = await authFetch(
        `${API}/projects/${encodeURIComponent(projectId)}/operations`
    );
    return res.json();
}

export async function deleteProject(projectId) {
    const res = await authFetch(
        `${API}/projects/${encodeURIComponent(projectId)}`,
        { method: "DELETE" }
    );
    return res.json();
}

export async function rebuildProjectFromBase(baseFile, operations = []) {
    let currentFile = baseFile;

    for (const operation of operations) {
        console.log("[REBUILD] current operation:", operation);

        if (operation.category === "FILTER") {
            const blob = await sendFilterRequest(
                currentFile,
                operation.tool,
                operation.params || {}
            );

            currentFile = new File([blob], "rebuilt-filter.png", {
                type: blob.type || "image/png",
            });
            continue;
        }

        if (operation.category === "TRANSFORM") {
            const blob = await transformImage(
                currentFile,
                operation.tool,
                operation.params || {}
            );

            currentFile = new File([blob], "rebuilt-transform.png", {
                type: blob.type || "image/png",
            });
            continue;
        }

        if (operation.category === "MANUAL") {
            if (operation.tool === "MANUAL_BATCH") {
                const nestedActions = operation.params?.actions || [];

                for (const nestedAction of nestedActions) {
                    const payload = { ...nestedAction };
                    const nestedTool = payload.type;
                    delete payload.type;

                    if (Array.isArray(payload.points)) {
                        payload.points = JSON.stringify(payload.points);
                    }

                    const blob = await sendManualEditRequest(
                        currentFile,
                        nestedTool,
                        payload || {}
                    );

                    currentFile = new File([blob], "rebuilt-manual-batch.png", {
                        type: blob.type || "image/png",
                    });
                }

                continue;
            }

            const blob = await sendManualEditRequest(
                currentFile,
                operation.tool,
                operation.params || {}
            );

            currentFile = new File([blob], "rebuilt-manual.png", {
                type: blob.type || "image/png",
            });
            continue;
        }

        throw new Error(
            `Unsupported operation category: ${operation.category}, tool: ${operation.tool}`
        );
    }

    return currentFile;
}