import './styles/App.css';
import './styles/index.css';
import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import {UserProvider, useUser} from "./UserContext";
import SavedImagesPage from "./components/pages/SavedImagesPage";

function ProtectedRoute({ children }) {
    const { user, loading } = useUser();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return children;
}

export default function App() {
    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<RegisterPage />} />
                    <Route path="/saved" element={<SavedImagesPage />} />
                </Routes>
            </Router>
        </UserProvider>
    );
}
