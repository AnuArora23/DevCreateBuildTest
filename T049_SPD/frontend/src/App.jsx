import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import SoilHealthPage from "./components/SoilHealthPage";
import MarketTable from "./components/MarketTable";
import ChatBot from "./components/ChatBot";
import WeatherAlert from "./components/WeatherAlert";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PestDetection from "./components/PestDetection";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/soilHealth" element={<SoilHealthPage />} />
        <Route path="/marketPrice" element={<MarketTable />} />
        <Route path="/chatBot" element={<ChatBot />} />
        <Route path="/weatherAlert" element={<WeatherAlert />} />
        <Route path="/pestDetect" element={<PestDetection />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
