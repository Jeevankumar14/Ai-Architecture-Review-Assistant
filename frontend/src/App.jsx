import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewProject from './pages/NewProject';
import ProjectDetails from './pages/ProjectDetails';
import ChatAssistant from './pages/ChatAssistant';
import LandingDemoV2 from './components/landing-v2/LandingDemoV2';
import LandingDemoV3 from './components/landing-v3/LandingDemoV3';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingDemoV3 />} />
          <Route path="/v1" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/demo-v2" element={<LandingDemoV2 />} />
          <Route path="/demo-v3" element={<LandingDemoV3 />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/projects/:id/chat" element={<ChatAssistant />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
