import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CarbonProvider } from './context/CarbonContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Insights from './pages/Insights';
import Tips from './pages/Tips';
import Assistant from './pages/Assistant';
import Settings from './pages/Settings';
import AssistantWidget from './components/AssistantWidget';

function AppContent() {
  const location = useLocation();
  const showSidebar = ['/dashboard', '/tracker', '/insights', '/tips', '/settings', '/assistant'].includes(location.pathname);

  return (
    <div className="app-wrapper">
      <Navbar />
      <div className="main-container">
        {showSidebar && <Sidebar />}
        <main className={showSidebar ? 'sidebar-layout' : 'no-sidebar-layout'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <div className="inner-page text-center" style={{ padding: '4rem 1.5rem' }}>
                  <h1 className="page-title">404 - Not Found</h1>
                  <p className="page-description" style={{ margin: '1rem 0' }}>The page you are looking for does not exist.</p>
                  <a href="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>Go Home</a>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
      {showSidebar && <AssistantWidget />}
      {!showSidebar && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <CarbonProvider>
      <Router>
        <AppContent />
      </Router>
    </CarbonProvider>
  );
}
