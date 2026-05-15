import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Download from './pages/Download';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/download" element={<Download />} />
        {/* Redirect all other routes to the download page */}
        <Route path="*" element={<Navigate to="/download" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
