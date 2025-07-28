import { Link } from 'react-router-dom'
import { useAuth } from '../features/account/useAuth'
import { useState, useEffect, useRef } from 'react'

const Header = () => {
  const { userName, logoutUser } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Games Link */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="mr-2">🎮</span>
              Sahib Game Store
            </Link>
            
            <Link 
              to="/games" 
              className="px-4 py-2 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-gray-700"
            >
              Games
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {userName ? (
              <>
                {/* Cart Link */}
                <Link 
                  to="/cart" 
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                  title="Shopping Cart"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                  </svg>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(prev => !prev)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#374151',
                      cursor: 'pointer'
                    }}
                    className="flex items-center space-x-2 px-3 py-2 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                  >
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block" style={{ color: '#374151' }}>
                      {userName}
                    </span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ color: '#6B7280' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">Signed in</p>
                      </div>
                      
                      <Link
                        to="/account"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        style={{ color: '#374151' }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6B7280' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        style={{ color: '#374151' }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6B7280' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My Orders
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            logoutUser()
                            setDropdownOpen(false)
                          }}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#DC2626',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%'
                          }}
                          className="flex items-center px-4 py-2 text-sm hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#EF4444' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                  style={{ color: '#374151' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm"
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header