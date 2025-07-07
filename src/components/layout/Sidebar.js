import { Link } from "react-router-dom";
import { PanelLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../../features/sidebar/sidebarSlice";

export const Sidebar = () => {
    const isOpen = useSelector((state) => state.sidebar.isOpen)
    const dispatch = useDispatch()

    const handleToggleSidebar = () => {
        dispatch(toggleSidebar())
    }

    return(
        <nav className={`flex min-h-screen flex-col gap-2 bg-neutral-50 ${isOpen ? 'w-[200px]' : 'w-[60px]'} transition-all duration-300`}>
            <div className={`fixed top-0 left-0 flex h-screen flex-col overflow-y-auto no-scrollbar p-4 gap-3 ${isOpen ? 'w-[200px]' : 'w-0'} transition-all duration-400`}>
                <PanelLeft className={`w-4 h-4 mb-4 cursor-pointer text-neutral-500`} onClick={handleToggleSidebar} />
                <div className={`flex flex-col gap-3 ${isOpen ? "visible" : "hidden"} `}>
                    <Link to="/" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 no-underline">Machine Performance</Link>
                    <Link to="/process-flow" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 no-underline">Process Flow</Link>
                </div>
            </div>
        </nav>
    )
}