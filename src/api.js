const BASE_URL = 'http://localhost:8080/api';

export async function fetchFormats() {
    try {
        const response = await fetch(`${BASE_URL}/formats`);
        if (!response.ok) throw new Error('Failed to fetch formats');
        return await response.json();
    } catch (error) {
        console.error('fetchFormats error:', error);
        return [{ value: 'png', label: 'PNG', mimeType: 'image/png' }];
    }
}

export async function convertToFormat(file, format) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    try {
        const response = await fetch(`${BASE_URL}/convert/to`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to convert');
        return await response.blob();
    } catch (error) {
        console.error('convertToFormat error:', error);
        throw error;
    }
}

export async function sendFilterRequest(file, filterName, params = {}) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', filterName);

    Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
    });

    const response = await fetch('http://localhost:8080/api/image/filter', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    return await response.blob();
}

export async function registerRequest(email, password) {
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const message = await res.text();
            throw new Error(message || 'Registration failed');
        }

        return await res.json();
    } catch (err) {
        console.error('registerRequest error:', err);
        throw err;
    }
}

export async function verifyToken(idToken) {
    const res = await fetch(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`
        }
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Token verification failed');
    }

    return await res.json();
}

export async function saveImageToServer(blob, userId, formatId) {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('userId', userId);
    formData.append('formatId', formatId);

    const response = await fetch(`${BASE_URL}/firestore/save`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to save image');
    }

    return response.json();
}

export async function fetchUserImages(userId) {
    const response = await fetch(`${BASE_URL}/firestore/load?userId=${userId}`);
    if (!response.ok) {
        throw new Error("Failed to load images");
    }
    const data = await response.json();
    return data.images;
}

export async function deleteUserImage(userId, path) {
    const url = `${BASE_URL}/firestore/delete?userId=${encodeURIComponent(userId)}&path=${encodeURIComponent(path)}`;
    const response = await fetch(url, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete image: ${error}`);
    }

    return response.json();
}