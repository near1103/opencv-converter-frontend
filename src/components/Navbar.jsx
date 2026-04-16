import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export default function Navbar() {
    const { user, setUser, logout } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setMenuOpen(false);
        if (logout) logout();
        else setUser(null);
        navigate("/login");
    };

    return (
        <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
            {/* Logo */}
            <div
                className="text-2xl font-bold cursor-pointer hover:text-blue-100 transition-colors"
                onClick={() => navigate("/")}
                title="Go to Home"
            >
                Image Converter
            </div>

            {/* User section */}
            {user ? (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none"
                    >
                        <span>{user.email || "Account"}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg border border-gray-200 overflow-hidden z-20 animate-fadeIn">
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    navigate("/saved");
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-blue-100 transition-colors"
                            >
                                Saved Images
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 hover:bg-blue-100 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex space-x-3">
                    <Link to="/login">
                        <button className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md shadow-sm transition-colors">
                            Login
                        </button>
                    </Link>
                    <Link to="/signup">
                        <button className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md shadow-sm transition-colors">
                            Sign Up
                        </button>
                    </Link>
                </div>
            )}
        </nav>
    );
}