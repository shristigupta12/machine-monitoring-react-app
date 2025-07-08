This project implements a React application for industrial machine monitoring and process flow management, as detailed below:

Implemented Features & Technologies
The application is built using React.js with Redux Toolkit for state management, leveraging React Router DOM for navigation. Styling is handled with Tailwind CSS. Data for the application is simulated using local JSON files, mimicking API responses. Charting and graph visualizations are primarily implemented using D3.js and ReactFlow.

1. API Simulation
The project simulates backend API calls by serving static JSON files.


src/api/changelogApi.js: Imports changelog.json from Machine1-SSP0173 and Machine2-SSP0167 directories to simulate fetching tool sequence mappings, learned thresholds, and ideal signal data. 

src/api/predictionDataApi.js: Imports prediction_data.json for both machines, providing the scatter plot data points, including anomaly flags and unprocessed sequence counts.


src/api/timeSeriesApi.js: Imports various timeseries_cycledata_*.json files (red, green, black) for both machines to simulate fetching detailed time series data for actual signals. 


src/api/processFlowApi.js: Imports graphViz.json to provide the data required for the process flow tree visualization. 

Each API function simulates a network delay using 

setTimeout to mimic real-world asynchronous data fetching. 

2. State Management (Redux Toolkit)
The application uses Redux Toolkit to manage global state:

src/features/filters/filtersSlice.js: Manages the state for machine selection, start and end dates, and selected tool sequences on the Scatter Plot page.

src/features/scatterMarkings/scatterMarkingsSlice.js: Handles fetching and processing of scatter plot data, including distance, anomaly status, and unprocessed_sequences from prediction_data.json.


src/features/timeSeriesGraph/timeSeriesGraphSlice.js: Manages the visibility and data for the time series graph, including fetching actualSignalData and idealSignalData based on user interaction. 

src/features/toolSequences/toolSequencesSlice.js: Manages the state related to tool sequences, likely used for populating dropdowns and correlating with data.

3. Navigation
A collapsible left sidebar (

src/components/layout/Sidebar.js) is implemented for navigating between the two main pages: "Scatter Plot" and "Process Flow". 

4. Page 1: Scatter Data Visualization (src/pages/ScatterPlotPage.js)
This page displays interactive data visualizations:

Filtering and UI Controls (src/components/scatter-plot/filterHeading.js):

Allows users to select a machine (e.g., 'SSP0173' or 'SSP0167').

Provides date and time range pickers for filtering data.

Includes a tool sequence selector.

Features a "Search" button to apply filters and a "Show Comparison" toggle. 

Graph 1 - Distance vs Time Scatter Plot (src/components/scatter-plot/scatter-plot-graph/scatterPlot.js):

Implemented using D3.js.

Plots data points from 

prediction_data.json, where the X-axis represents epoch timestamps and the Y-axis represents 'distance' values. 


Data points are color-coded: green for normal (

anomaly: false), red for anomalies (anomaly: true), and black for unprocessed/unknown status (anomaly: null). 



A red threshold line is drawn based on learned_parameters.threshold from changelog.json.

Hover tooltips display detailed cycle information (ID, start/end times, values).

Clicking on a scatter plot dot triggers the display of the 

Time Series Analysis graph below. 


Graph 2 - Time Series Analysis (src/components/scatter-plot/time-series-graph/TimeSeriesGraph.js):

Also implemented using D3.js.

Appears when a scatter plot dot is clicked.

Displays two lines: "Actual Signal" (blue) from 

timeseries_cycledata_*.json and "Ideal Signal" (light blue) from changelog.json. 

The X-axis represents time within the cycle (in seconds), and the Y-axis shows signal intensity values. 

Includes logic to determine and display the "Reason for Unprocessed Cycle" for black data points, comparing actual data points against 

min_points and max_points from changelog.json. 


5. Page 2: Tree Visualization (src/pages/ProcessFlowPage.js)
This page visualizes the industrial process flow:

Node Visualization:

Implemented using 

ReactFlow. 


Nodes represent machines, displaying their ID, Machine Number (

station_number), and Name. 


Nodes are color-coded based on their status: red for 

not_allowed_list, blue for bypass_list, and white for others, as defined in graphViz.json. 


Connections between nodes (

input_stations) visually represent the process flow. 

Interactive Features:

Node Selection and Editing: Users can click on a node to select it, which populates a form on the left. The form allows editing of the node's name and station number. 


Status Toggles: Checkboxes for "Is Bypassed" and "Is Not Allowed" allow dynamic modification of a node's color and status, which updates the bypass_list and not_allowed_list in the simulated graphData. 


Hover Details: Moving the mouse over a node displays a tooltip with its full details (name, ID, station number, and current bypass/not allowed status). 


Drag & Drop: Nodes can be freely dragged and dropped within the canvas, and their positions are updated dynamically. 

6. Reusable UI Components
The project includes basic, reusable UI components within the src/components/design-system directory, such as input.js and select.js, promoting a consistent design.

7. Responsive Design
The src/utils/responsive.js utility is present, suggesting an implementation for adapting layout and components to different screen sizes.