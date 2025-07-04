import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ScatterPlotPage from './pages/ScatterPlotPage';
import ProcessFlowPage from './pages/ProcessFlowPage';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Simple Navigation Bar (will be replaced by sidebar later) */}
        <nav className="App-nav">
          <ul>
            <li>
              <Link to="/">Machine Performance</Link>
            </li>
            <li>
              <Link to="/process-flow">Process Flow</Link>
            </li>
          </ul>
        </nav>

        <main className="App-content">
          <Routes>
            <Route path="/" element={<ScatterPlotPage />} />
            <Route path="/process-flow" element={<ProcessFlowPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
