import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerRequest } from '../../api';
import Navbar from "../Navbar";
import Toast from "../ui-elements/Toast";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast(null);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        try {
            await registerRequest(email, password);
            showToast('Registration successful! Navigating to login...', 'success');

            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            showToast(err.message || 'Registration failed', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex flex-col">
            <Navbar />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            <div className="flex-1 flex items-center justify-center">
                <form
                    onSubmit={handleRegister}
                    className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 border border-blue-100"
                >
                    <h2 className="text-2xl font-semibold text-center text-blue-600">Create Account</h2>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Sign Up
                    </button>

                    <p className="text-sm text-center text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
