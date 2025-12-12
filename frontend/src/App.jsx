import { Routes, Route, Link } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Task from "./components/Task";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import axios from "axios";
import welcome from "/public/welcome.svg";



function App() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authed, setAuthed] = useState(() => !!(typeof window !== 'undefined' && localStorage.getItem('token')));

  // Initialize axios Authorization from localStorage
  const stored = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (stored && !axios.defaults.headers.common.Authorization) {
    axios.defaults.headers.common.Authorization = `Bearer ${stored}`;
  }

  useEffect(() => {
    const id = axios.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common.Authorization;
          window.dispatchEvent(new Event('authChange'));
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    );
    const onAuthChange = () => setAuthed(!!localStorage.getItem('token'));
    window.addEventListener('authChange', onAuthChange);
    window.addEventListener('storage', onAuthChange);
    return () => {
      axios.interceptors.response.eject(id);
      window.removeEventListener('authChange', onAuthChange);
      window.removeEventListener('storage', onAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common.Authorization;
    setAuthed(false);
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🌟 NAVBAR */}
      <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-14 px-4">
          
          {/* LEFT - LOGO */}
          <Link to="/" className="text-xl font-semibold text-indigo-600">
            ProjectManagement
          </Link>

          {/* MOBILE MENU BUTTON */}
          {/* <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button> */}

          {/* RIGHT - DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
            {!authed ? (
              <>
                <Link to="/login" className="text-gray-700 hover:text-indigo-600">Login</Link>
                <Link to="/signup" className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700">Sign up</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">Logout</button>
            )}
          </div>
        </div>

        {/* MOBILE MENU PANEL */}
        
      </nav>

      {/* APP CONTENT BELOW NAVBAR */}
      <AppLayout>
        <Toaster position="top-right" gutter={8} />

        <Routes>
          <Route path="/:projectId" element={<PrivateRoute><Task /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/"
            element={
              <div className="flex flex-col items-center w-full pt-10 px-4">
                <img
                  src={welcome}
                  className="w-8/12 sm:w-6/12 md:w-4/12"
                  alt="welcome"
                />
                <h1 className="text-lg text-gray-600 mt-4 text-center">
                  Select or create a new project
                </h1>
              </div>
            }
          />
        </Routes>
      </AppLayout>
    </div>
  );
}

export default App;
