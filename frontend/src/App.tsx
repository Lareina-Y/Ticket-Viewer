import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FilterPage from './pages/FilterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FilterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;