// src/App.js
import React from "react";
import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Pocetna from "./components/Pocetna";
import Tabela from "./Proizvodi/Proizvodi";
import DodajProizvod from "./Proizvodi/DodajProizvod";
import EditProizvoda from "./Proizvodi/EditProizvoda";
import DeleteProizvoda from "./Proizvodi/DeleteProizvoda";
import Korpa from "./components/Korpa";
import Navbar from "./components/Navbar";
import LoginPage from "./login/LoginPage";
import SignUpPage from "./login/SignUpPage";
import DodajKorisnika from "./login/Dodajkorisnika";
import { AuthProvider } from "./login/auth";
import ProizvodDetalji from "./Proizvodi/ProizvodDetalji";
import Checkout from "./components/Checkout";
import FinalizacijaNarudzbine from "./components/FinalizacijaNarudzbine";
import AdminProizvodi from "./Proizvodi/AdminProzivodi";
import Kodzapopust from "./components/Kodzapopust";
import TransakcijaPrikaz from "./components/Transakcije"
import Footer from "./components/Footer";
import "./App.css";
import MojProfil from "./Profil/MojProfil";
import { WishlistProvider } from "./Profil/WishlistContext";
import { Navigate } from "react-router-dom";
import { useAuth } from "./login/auth";

function App() {
  const [korpa, setKorpa] = useState([]);

  const dodajUKorpu = (proizvod) => {
    setKorpa((prevKorpa) => [...prevKorpa, proizvod]);
  };
  const ukloniIzKorpe = (id) => {
    setKorpa((prevKorpa) => prevKorpa.filter((proizvod) => proizvod.id !== id));
  };

  const ProtectedRoute = ({ children, roles }) => {
    const { user } = useAuth();
    const storedUser = JSON.parse(localStorage.getItem("user")); // Fallback na localStorage
    const effectiveUser = user || storedUser; // Koristi kontekst ako postoji, inače localStorage

    if (!effectiveUser || !roles.includes(effectiveUser.uloga)) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
        <Navbar />
        <div className="main-content">
        <Routes>
          <Route path="/" element={<Pocetna />} />
          <Route
            path="/proizvodi"
            element={
              <Tabela dodajUKorpu={dodajUKorpu} ukloniIzKorpe={ukloniIzKorpe} />
            }
          />{" "}
          <Route path="/dodaj-proizvod" element={<ProtectedRoute roles={['admin']}><DodajProizvod /></ProtectedRoute>} />
          <Route path="/edit-proizvoda" element={<ProtectedRoute roles={['admin']}><EditProizvoda /></ProtectedRoute>} />
          <Route path="/delete-proizvoda/:id" element={<ProtectedRoute roles={['admin']}><DeleteProizvoda /></ProtectedRoute>} />
          <Route
            path="/korpa"
            element={<Korpa korpa={korpa} ukloniIzKorpe={ukloniIzKorpe} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/Signup" element={<SignUpPage />} />
          <Route path="/dodajkorisnika" element={<ProtectedRoute roles={['admin']}><DodajKorisnika /></ProtectedRoute>} />
          <Route
            path="/proizvodi/:id"
            element={<ProizvodDetalji dodajUKorpu={dodajUKorpu} />}
          />
          <Route path="/checkout" element={<Checkout korpa={korpa} />} />
          <Route path="/zavrsi" element={<FinalizacijaNarudzbine />} />
          <Route path="/adminproizvodi" element={<ProtectedRoute roles={['admin']}><AdminProizvodi /></ProtectedRoute>} />
          <Route path="/kodzapopust" element={<ProtectedRoute roles={['admin']}><Kodzapopust /></ProtectedRoute>} />
          <Route path="/transakcije" element={<TransakcijaPrikaz/>}/>
          <Route path="/profil" element={<MojProfil />} />
        </Routes>
        </div>
        <Footer />
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
//resen konfilkt
