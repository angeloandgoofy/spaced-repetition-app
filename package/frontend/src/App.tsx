import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import DeckList from './pages/DeckList';
import SingUp from './pages/signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/decks" element={<DeckList />} />
        <Route path="/signup" element={<SingUp/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;