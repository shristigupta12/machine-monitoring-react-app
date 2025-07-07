import { Link } from "react-router-dom";
import { PanelLeft } from "lucide-react";
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
        <nav className={`flex min-h-screen flex-col gap-2 bg-neutral-50 ${isOpen ? 'w-[250px]' : 'w-[50px]'} transition-all duration-300 shadow-md`}>
            <div className={`fixed top-0 left-0 flex h-screen flex-col overflow-y-auto no-scrollbar py-4 px-3 gap-3 ${isOpen ? 'w-[250px]' : 'w-0'} transition-all duration-400`}>
                <PanelLeft className={`w-4 h-4 mb-4 cursor-pointer text-neutral-500 hover:text-neutral-900`} onClick={handleToggleSidebar} />
                <div className={`flex flex-col gap-3 ${isOpen ? "visible" : "hidden"} `}>
                    <Link to="/machine-performance" className={`text-sm font-medium text-neutral-700 hover:text-neutral-900 no-underline p-2 rounded-lg ${isActive("/machine-performance") ? " bg-neutral-200" : ""}`}>Machine Monitoring</Link>
                    <Link to="/process-flow" className={`text-sm font-medium text-neutral-700 hover:text-neutral-900 no-underline p-2 rounded-lg ${isActive("/process-flow") ? "bg-neutral-200" : ""}`}>Process Visualization</Link>
                </div>
            </div>
        </nav>
    )
}