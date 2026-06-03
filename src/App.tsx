import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Intro from './components/sections/Intro';
import About from './components/sections/About';
import Diagram from './components/sections/Diagram';
import Footer from './components/layout/Footer';
import Promotion from './components/sections/Promotion';
import Contact from './components/sections/Contact';
import AdminProduct from './components/admin/AdminProduct';
import Products from './components/pages/Products'; // 1. Import trang Products

function HomePage() {
  return (
    <>
      <Intro />
      <About />
      <Diagram />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="font-sans text-gray-800 bg-gray-50 min-h-screen antialiased flex flex-col justify-between">
        <div>
          <Header />
          
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/khuyen-mai" element={<Promotion />} />
              <Route path="/lien-he" element={<Contact />} />
              
              {/* 2. Tuyến đường cho trang Sản phẩm (Khách hàng) */}
              <Route path="/san-pham" element={<Products />} />
              
              <Route path="/admin" element={<AdminProduct />} />
            </Routes>
          </main>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
}