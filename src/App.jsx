import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Otp from './pages/Otp';
import Home from './pages/Home';
import BuyArb from './pages/BuyArb';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/buy-arb" element={<BuyArb />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
