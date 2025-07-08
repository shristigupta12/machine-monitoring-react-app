import { Sidebar } from "./Sidebar"

export const LayoutContainer = ({children}) => {
    return(
        <div className="flex flex-col lg:flex-row min-h-screen">
            <Sidebar />
            <div className="flex-1 p-4 lg:p-6 w-full lg:w-auto">
                {children}
            </div>
        </div>
    )
}