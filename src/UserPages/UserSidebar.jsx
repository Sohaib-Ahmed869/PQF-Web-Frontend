import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaHeadset,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaImages,
  FaBlog,
  FaBars,
  FaTimes,
  FaTag,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaStar,
  FaExclamationTriangle,
  FaCartArrowDown
} from 'react-icons/fa'
import logo from "../assets/PQF-22.png"

export default function UserSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');

  const menuItems = [
    { to: '/user/addresses', icon: FaMapMarkerAlt, label: 'Addresses', show: true },
    { to: '/user/orders', icon: FaBox, label: 'Orders', show: isLoggedIn },
    { to: '/user/abandoned-carts', icon: FaCartArrowDown, label: 'Abandoned Carts', show: isLoggedIn },
    { to: '/user/disputes', icon: FaExclamationTriangle, label: 'Disputes', show: isLoggedIn },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 rounded-xl bg-gradient-to-r from-green-600 to-lime-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-in-out flex flex-col
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white shadow-lg border-r border-gray-200
        `}
        style={{
          background: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'none'
        }}
      >
        {/* Header - Fixed */}
        <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-b border-gray-200 bg-gradient-to-r from-transparent via-gray-100 to-transparent transition-all duration-300 flex-shrink-0`}>
          <div className="flex items-center">
            {/* Logo/Brand Section */}
            <div className="flex items-center flex-grow justify-center">
              {!isCollapsed ? (
                <div className="flex flex-col items-center w-full space-y-3">
                  {/* Logo using assets folder */}
                  <NavLink to="/home">
                    <div className="w-24 h-24 relative bg-gray-100 rounded-2xl p-2 shadow-inner">
                      <div className="absolute inset-0 bg-white/50 rounded-2xl pointer-events-none"></div>
                      <img 
                        src={logo} 
                        alt="Premier Quality Foods Logo" 
                        className="w-full h-full object-contain relative z-10 brightness-100 contrast-100 drop-shadow-sm"
                        style={{
                           filter: 'none'
                        }}
                        onError={(e) => {
                          // Fallback if logo doesn't exist
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      {/* Fallback icon if logo fails to load */}
                      <div className="w-full h-full items-center justify-center text-gray-700 text-2xl font-bold drop-shadow-sm" style={{display: 'none'}}>
                        CC
                      </div>
                    </div>
                  </NavLink>
                  
                  <div className="text-center">
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mt-1 mb-1"></div>
                    <p className="text-xs text-gray-500 font-medium tracking-wider">USER PANEL</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full py-1">
                  <NavLink to="/user/addresses">
                    <div className="w-12 h-12 relative bg-gray-100 rounded-xl p-1.5 shadow-inner">
                      <img 
                        src={logo} 
                        alt="CC Logo" 
                        className="w-full h-full object-contain relative z-10 brightness-100 contrast-100"
                        style={{
                           filter: 'none'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full items-center justify-center text-gray-700 text-xs font-bold drop-shadow-sm" style={{display: 'none'}}>
                        CC
                      </div>
                    </div>
                  </NavLink>
                </div>
              )}
            </div>
            
            {/* Collapse Button - Only show when not collapsed */}
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-300 border border-gray-300 items-center justify-center ml-auto"
              >
                <FaBars className="text-sm" />
              </button>
            )}
          </div>
          
          {/* Expand Button - Only show when collapsed */}
          {isCollapsed && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-300 border border-gray-300 items-center justify-center"
              >
                <FaBars className="text-sm" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation - Scrollable */}
        <nav className={`
          flex-1 ${isCollapsed ? 'px-1 py-2' : 'px-3 py-3'} space-y-1 overflow-y-auto overflow-x-hidden
          transition-all duration-300
          scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-500
        `}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(209, 213, 219, 1) transparent'
        }}>
          {menuItems.filter(item => item.show).map((item, index) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center ${isCollapsed ? 'p-2.5 justify-center' : 'p-3'} rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                    isActive
                      ? 'bg-[#fbeaea] text-[#8e191c] shadow-md shadow-[#fbeaea]/50 border border-[#e7bcbc]'
                      : 'text-gray-700 hover:bg-[#fbeaea] hover:text-[#8e191c] hover:border-[#e7bcbc] border border-transparent'
                  }`
                }
                style={{
                  animationDelay: `${index * 30}ms`
                }}
              >
                {({ isActive }) => (
                  <>
                    {/* Glow effect for active item */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-[#fbeaea]/70 blur-sm pointer-events-none" />
                    )}
                    
                    <div className="relative z-10 flex items-center w-full">
                      <Icon className={`text-lg ${isActive ? 'text-[#8e191c]' : 'text-gray-500 group-hover:text-[#8e191c]'} transition-colors duration-300 flex-shrink-0`} />
                      
                      {!isCollapsed && (
                        <span className={`ml-3 font-semibold truncate ${isActive ? 'text-[#8e191c]' : 'text-gray-700 group-hover:text-[#8e191c]'} transition-colors duration-300`}>
                          {item.label}
                        </span>
                      )}
                      
                      {/* Hover tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-12 bg-[#8e191c]/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 border border-[#e7bcbc]/30 shadow-xl shadow-[#8e191c]/20 pointer-events-none">
                          {item.label}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#8e191c] rotate-45 border-l border-b border-[#e7bcbc]/30"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-[#8e191c] rounded-l-full shadow-md shadow-[#8e191c]/50 pointer-events-none" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className={`${isCollapsed ? 'p-2' : 'p-3'} border-t border-gray-200 transition-all duration-300 flex-shrink-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent`}>
          <button
            onClick={handleLogout}
            className={`
              group w-full flex items-center ${isCollapsed ? 'p-2.5 justify-center' : 'p-3'} rounded-xl transition-all duration-300 transform hover:scale-[1.02]
              text-gray-700 hover:bg-red-100/50 hover:text-red-600 border border-transparent hover:border-red-300 relative
            `}
          >
            <FaSignOutAlt className="text-lg text-gray-500 group-hover:text-red-500 transition-colors duration-300 flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 font-semibold text-gray-700 group-hover:text-red-600 transition-colors duration-300">Logout</span>
            )}
            
            {/* Hover tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-12 bg-gray-800/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 border border-red-400/30 shadow-xl shadow-red-500/20 pointer-events-none">
                Logout
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45 border-l border-b border-red-400/30"></div>
              </div>
            )}
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/3 right-0 w-px h-24 bg-gradient-to-b from-transparent via-gray-400/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-1/3 right-0 w-px h-24 bg-gradient-to-b from-transparent via-gray-400/40 to-transparent pointer-events-none" />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-0 pointer-events-none">
          <div className="absolute top-10 left-1/2 w-20 h-20 bg-lime-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-green-200 rounded-full blur-3xl"></div>
        </div>
      </div>
    </>
  )
}