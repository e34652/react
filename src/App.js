import React from 'react';
import Header from './components/Header';
import DashBoard from './components/DashBoard';
import Dummy from './components/Dummy';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>

        <Header />
        <Routes>
          <Route path="/main" element={<Main />} />
          <Route path="/dummy" element={<Dummy />} />
          <Route path="/statistics" element={<DashBoard />} />
        </Routes>

      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
