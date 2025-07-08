import { Link } from "react-router-dom";
import { PanelLeft, Menu, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../../features/sidebar/sidebarSlice";
import { useLocation } from "react-router-dom";

export const Sidebar = () => {
    const isOpen = useSelector((state) => state.sidebar.isOpen)
    const dispatch = useDispatch()
    const location = useLocation()

    const isActive = (path) => {
        return location.pathname === path
    }

    const handleToggleSidebar = () => {
        dispatch(toggleSidebar())
    }

    return(
        <div>
            {/* Mobile overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={handleToggleSidebar}
                />
            )}
            
            {/* Mobile hamburger button */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-md shadow-md"
                onClick={handleToggleSidebar}
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar */}
            <nav className={`
                fixed lg:static top-0 left-0 z-40 min-h-screen h-full
                flex flex-col gap-2 bg-neutral-50 shadow-md
                transition-all duration-300 ease-in-out border-r
                ${isOpen 
                    ? 'w-64 translate-x-0' 
                    : 'w-0 lg:w-12 -translate-x-full lg:translate-x-0'
                }
            `}>
                <div className={`
                    flex h-full flex-col overflow-y-auto no-scrollbar 
                    py-4 px-3 gap-3
                    ${isOpen ? 'w-64' : 'w-0 lg:w-16'}
                    transition-all duration-300
                `}>
                    {/* Desktop toggle button */}
                    <div className="hidden lg:block">
                        <PanelLeft 
                            className="w-4 h-4 mb-4 cursor-pointer text-neutral-500 hover:text-neutral-900" 
                            onClick={handleToggleSidebar} 
                        />
                    </div>
                    
                    {/* Navigation links */}
                    <div className={`
                        flex flex-col gap-3
                        ${isOpen ? "visible" : "hidden"}
                    `}>
                        <Link 
                            to="/machine-performance" 
                            className={`
                                text-sm font-medium text-neutral-700 hover:text-neutral-900 
                                no-underline p-2 rounded-lg transition-colors
                                ${isActive("/machine-performance") ? "bg-neutral-200" : ""}
                            `}
                        >
                            Machine Monitoring
                        </Link>
                        <Link 
                            to="/process-flow" 
                            className={`
                                text-sm font-medium text-neutral-700 hover:text-neutral-900 
                                no-underline p-2 rounded-lg transition-colors
                                ${isActive("/process-flow") ? "bg-neutral-200" : ""}
                            `}
                        >
                            Process Visualization
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    )
}