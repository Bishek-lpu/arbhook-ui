import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Otp from './pages/Otp';
import Home from './pages/Home';
import BuyArb from './pages/BuyArb';
import Payment from './pages/Payment';
import Plan from './pages/Plan';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/plan" element={<Plan />} />
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
