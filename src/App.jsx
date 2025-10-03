import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import ItemDetail from './pages/ItemDetail';
import Saved from './pages/Saved';
import Recommendations from './pages/Recommendations';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-anime-dark">
        <Sidebar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:type/:id" element={<ItemDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <PWAInstallPrompt />
      </div>
    </Router>
  );
}

export default App;
