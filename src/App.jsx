import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Otp from './pages/Otp';
import Home from './pages/Home';
import BuyArb from './pages/BuyArb';
import Payment from './pages/Payment';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/buy-arb" element={<BuyArb />} />
          {/* Note: I did not protect /payment here as it handles its own logic, 
              but let me know if it should be protected too! */}
        </Route>
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
