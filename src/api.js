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
