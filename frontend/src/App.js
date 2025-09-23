import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CasesBrowser from './components/CasesBrowser';
import { generateSessionId } from './utils/session';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled(motion.main)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId] = useState(() => generateSessionId());

  useEffect(() => {
    // Initialize session
    if (!sessionId) {
      console.error('Failed to generate session ID');
    }
  }, [sessionId]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppContainer>
      <Header onToggleSidebar={toggleSidebar} />
      
      <MainContent>
        <AnimatePresence>
          {sidebarOpen && (
            <Sidebar onClose={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>
        
        <ContentArea
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route 
              path="/" 
              element={<ChatInterface sessionId={sessionId} />} 
            />
            <Route 
              path="/cases" 
              element={<CasesBrowser />} 
            />
            <Route 
              path="/chat" 
              element={<ChatInterface sessionId={sessionId} />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ContentArea>
      </MainContent>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2a2a2a',
            color: '#fff',
            border: '1px solid #444',
          },
        }}
      />
    </AppContainer>
  );
}

export default App;
