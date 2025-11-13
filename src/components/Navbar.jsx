import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import tailwindClasses from '../styles/tailwindClasses';
import { useUser } from '../UserContext';
import { auth } from '../firebase';

export default function Navbar() {
    const { user, setUser } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await auth.signOut();
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className={tailwindClasses.navbar}>
            <div
                className="text-xl font-bold cursor-pointer"
                onClick={() => navigate('/')}
                title="Go to Home"
            >
                Image Converter
            </div>

            {user ? (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`${tailwindClasses.navbarBtn} relative`}
                    >
                        {user.email}
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-blue-600 text-white rounded-md shadow-lg z-10 border border-blue-700">
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    navigate('/saved');
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-blue-700 transition-colors"
                            >
                                Saved Images
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 hover:bg-blue-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-x-4">
                    <Link to="/login">
                        <button className={tailwindClasses.navbarBtn}>Login</button>
                    </Link>
                    <Link to="/signup">
                        <button className={tailwindClasses.navbarBtn}>Sign Up</button>
                    </Link>
                </div>
            )}
        </nav>
    );
}

