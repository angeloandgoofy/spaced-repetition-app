import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import DeckList from './pages/DeckList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/decks" element={<DeckList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;