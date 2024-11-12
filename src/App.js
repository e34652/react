import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from "./components/MyComponent";

const queryClient = new QueryClient();

function App() {
  return (
<QueryClientProvider client={queryClient}>
     <MyComponent/>
     
     </QueryClientProvider>
  );
}

export default App;
