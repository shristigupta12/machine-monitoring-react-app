import { Sidebar } from "./Sidebar"

export const LayoutContainer = ({children}) => {
    return(
        <div className="flex flex-col lg:flex-row min-h-screen">
            <Sidebar />
            <div className="flex-1 p-6 lg:p-8 w-full lg:w-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {children}
            </div>
        </div>
    )
}