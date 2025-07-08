import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScatterPlotPage from './pages/ScatterPlotPage';
import ProcessFlowPage from './pages/ProcessFlowPage';
import IndexPage from './pages/index';
import { LayoutContainer } from './components/layout/layoutContainer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <LayoutContainer>
          <main className="w-full">
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/machine-performance" element={<ScatterPlotPage />} />
              <Route path="/process-flow" element={<ProcessFlowPage />} />
            </Routes>
          </main>
        </LayoutContainer>
      </Router>
    </div>
  );
}

export default App;
