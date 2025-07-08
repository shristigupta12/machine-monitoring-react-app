import { Link } from "react-router-dom";
import { PanelLeft, Menu, X, BarChart3, GitBranch } from "lucide-react";
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
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={handleToggleSidebar}
                />
            )}
            
            {/* Mobile hamburger button */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden bg-white p-3 rounded-xl shadow-soft border border-slate-200 hover:shadow-medium transition-all duration-200"
                onClick={handleToggleSidebar}
            >
                {isOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Sidebar */}
            <nav className={`
                fixed lg:static top-0 left-0 z-40 min-h-screen h-full
                flex flex-col gap-2 bg-white/80 backdrop-blur-md shadow-soft border-r border-slate-200/50
                transition-all duration-300 ease-in-out
                ${isOpen 
                    ? 'w-64 translate-x-0' 
                    : 'w-0 lg:w-20 -translate-x-full lg:translate-x-0'
                }
            `}>
                <div className={`
                    flex h-full flex-col overflow-y-auto no-scrollbar 
                    py-6 px-4 gap-4
                    ${isOpen ? 'w-64' : 'w-0 lg:w-16'}
                    transition-all duration-300
                `}>
                    {/* Desktop toggle button */}
                    <div className="hidden lg:block">
                        <button
                            onClick={handleToggleSidebar}
                            className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-soft"
                        >
                            <PanelLeft className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Navigation links */}
                    <div className={`
                        flex flex-col gap-3
                        ${isOpen ? "visible" : "hidden"}
                    `}>
                        <Link 
                            to="/machine-performance" 
                            className={`
                                flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-slate-900 
                                no-underline p-3 rounded-xl transition-all duration-200 group
                                ${isActive("/machine-performance") 
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-medium" 
                                    : "hover:bg-slate-100/80"
                                }
                            `}
                        >
                            <BarChart3 className={`w-5 h-5 ${isActive("/machine-performance") ? "text-white" : "text-slate-500 group-hover:text-slate-700"}`} />
                            <span>Machine Monitoring</span>
                        </Link>
                        <Link 
                            to="/process-flow" 
                            className={`
                                flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-slate-900 
                                no-underline p-3 rounded-xl transition-all duration-200 group
                                ${isActive("/process-flow") 
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-medium" 
                                    : "hover:bg-slate-100/80"
                                }
                            `}
                        >
                            <GitBranch className={`w-5 h-5 ${isActive("/process-flow") ? "text-white" : "text-slate-500 group-hover:text-slate-700"}`} />
                            <span>Process Visualization</span>
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    )
}