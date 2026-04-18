import './styles/App.css';
import './styles/index.css';

import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import SavedImagesPage from "./components/pages/SavedImagesPage";
import { UserProvider, useUser } from "./UserContext";

import { LoadingProvider } from "./loading/LoadingContext";
import LoadingOverlay from "./components/ui-elements/LoadingOverlay";

function ProtectedRoute({ children }) {
    const { user, loading } = useUser();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return children;
}

export default function App() {
    return (
        <UserProvider>
            <LoadingProvider>
                <Router>
                    <LoadingOverlay />

                    <Routes>
                        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<RegisterPage />} />
                        <Route path="/saved" element={<SavedImagesPage />} />
                    </Routes>
                </Router>
            </LoadingProvider>
        </UserProvider>
    );
}