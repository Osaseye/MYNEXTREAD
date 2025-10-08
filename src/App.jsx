import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MobileNavBar from './components/MobileNavBar';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import ItemDetail from './pages/ItemDetail';
import Saved from './pages/Saved';
import Recommendations from './pages/Recommendations';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-anime-dark">
        <Sidebar />
        <main className="relative z-10 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:type/:id" element={<ItemDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Routes>
        </main>
        <MobileNavBar />
      </div>
    </Router>
  );
}

export default App;
