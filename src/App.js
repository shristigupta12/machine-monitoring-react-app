import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScatterPlotPage from './pages/ScatterPlotPage';
import ProcessFlowPage from './pages/ProcessFlowPage';
import { LayoutContainer } from './components/layout/layoutContainer';

function App() {
  return (
    <Router>
      <LayoutContainer>
        <main>
          <Routes>
            <Route path="/" element={<ScatterPlotPage />} />
            <Route path="/process-flow" element={<ProcessFlowPage />} />
          </Routes>
        </main>
        </LayoutContainer>
    </Router>
  );
}

export default App;
