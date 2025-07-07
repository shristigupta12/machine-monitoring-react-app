export const GraphLabelDescription = () => {
    return(
        <div className="flex flex-wrap items-end mb-2 space-x-4 justify-end">
            <div className="flex items-center space-x-1">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#4caf4fcb' }}></span>
                <span>Cycle Anomaly: False</span>
            </div>
            <div className="flex items-center space-x-1">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#c62828e1' }}></span>
                <span>Cycle Anomaly: True</span>
            </div>
            <div className="flex items-center space-x-1">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#3333339f' }}></span>
                <span>Cycle Anomaly: Null</span>
            </div>
            <div className="flex items-center space-x-1">
                <span className="inline-block w-2 h-[1px]" style={{ background: '#EF9A9A' }}></span>
                <span className="inline-block w-2 h-[1px]" style={{ background: '#EF9A9A' }}></span>
                <span>Threshold</span>
            </div>
        </div>
    )
}