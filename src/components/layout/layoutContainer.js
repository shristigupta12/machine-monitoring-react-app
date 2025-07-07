import { Sidebar } from "./Sidebar"

export const LayoutContainer = ({children}) => {
    return(
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-6">
                {children}
            </div>
        </div>
    )
}