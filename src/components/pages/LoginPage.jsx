import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { getIdToken } from 'firebase/auth';
import Navbar from "../Navbar";
import Toast from "../ui-elements/Toast";
import { useUser } from '../../UserContext';
import { verifyToken } from '../../api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();
    const { setUser } = useUser();

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast(null);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await getIdToken(userCredential.user);
            const userData = await verifyToken(token);
            setUser({ ...userData, token });

            showToast('Login successful! Navigating to home...', 'success');

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            showToast(err.message || 'Login failed', 'error');
        }
    };

    const handleSignupClick = () => {
        showToast('Navigating to signup...', 'info');
        setTimeout(() => {
            navigate('/signup');
        }, 1000);
    };

    return (
        <div>
            <Navbar />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            <div className="flex items-center justify-center min-h-screen bg-blue-50 px-4">
                <form onSubmit={handleLogin} className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg space-y-4">
                    <h2 className="text-2xl font-bold text-center text-blue-600">Welcome Back</h2>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border border-blue-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border border-blue-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Login
                    </button>
                    <div className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={handleSignupClick}
                            className="text-blue-500 hover:underline"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
