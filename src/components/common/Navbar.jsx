import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  Menu, 
  X,
  User,
  Settings,
  LogOut 
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white rounded-lg p-2">
              <span className="font-bold text-lg">SB</span>
            </div>
            <span className="font-semibold text-gray-900 text-xl">SCHOLORSHIP</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Only show Scholarships link for non-admin users */}
            {user?.role !== 'admin' && (
              <Link to="/scholarships" className="text-gray-700 hover:text-primary-600 font-medium">
                Scholarships
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                {/* Only show Dashboard for non-admin users */}
                {user?.role !== 'admin' && (
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                    Dashboard
                  </Link>
                )}
                {/* Show Admin link only for admin users */}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600 font-medium">
                    Admin
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                    <User className="h-5 w-5" />
                    <span>{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {/* Only show Profile link for non-admin users */}
                    {user?.role !== 'admin' && (
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="inline h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
            <div className="flex flex-col space-y-3">
              {/* Only show Scholarships link for non-admin users */}
              {user?.role !== 'admin' && (
                <Link 
                  to="/scholarships" 
                  className="text-gray-700 hover:text-primary-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Scholarships
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  {/* Only show Dashboard for non-admin users */}
                  {user?.role !== 'admin' && (
                    <Link 
                      to="/dashboard" 
                      className="text-gray-700 hover:text-primary-600 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {/* Show Admin link only for admin users */}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="text-gray-700 hover:text-primary-600 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-sm text-gray-500 mb-2">Welcome, {user?.name}</div>
                    <button 
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-primary-600 font-medium flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary inline-block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;