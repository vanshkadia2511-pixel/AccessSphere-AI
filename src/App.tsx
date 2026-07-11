import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Assistant } from './pages/Assistant';
import { Profile } from './pages/Profile';
import { Planner } from './pages/Planner';
import { LiveMap } from './pages/LiveMap';
import { Vision } from './pages/Vision';
import { Navigation } from './pages/Navigation';
import { Evaluation } from './pages/Evaluation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="planner" element={<Planner />} />
          <Route path="navigation" element={<Navigation />} />
          <Route path="live" element={<LiveMap />} />
          <Route path="vision" element={<Vision />} />
          <Route path="profile" element={<Profile />} />
          <Route path="score" element={<Evaluation />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
