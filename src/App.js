import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignUp from './pages/signup';
import Login from './pages/login';
import Chatroom from './pages/chatroom';

// A function to check if the user is authenticated
const isAuthenticated = () => !!localStorage.getItem('token');

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/chatroom" 
          element={isAuthenticated() ? <Chatroom /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/Login" />} />
      </Routes>
    </Router>
  );
}

export default App;
