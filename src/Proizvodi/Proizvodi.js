import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Proizvodi.css";
import { useNavigate } from "react-router-dom";

const Proizvodi = ({ dodajUKorpu, ukloniIzKorpe }) => {
  const [proizvodi, setProizvodi] = useState([]);
  const [korpaProizvodi, setKorpaProizvodi] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("Sve");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProizvodi = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/proizvodi");
        const filtriraniProizvodi = response.data.filter(proizvod => proizvod.kolicina > 0);
        setProizvodi(filtriraniProizvodi);
        setLoading(false);
      } catch (error) {
        console.error("Greška prilikom preuzimanja proizvoda:", error);
        setLoading(false);
      }
    };

    fetchProizvodi();
  }, []);

  const handleViseOProizvodu = (proizvod) => {
    navigate(`/proizvodi/${proizvod.id}`, { state: proizvod });
  };

  const handleDodajUKorpu = (proizvod) => {
    dodajUKorpu({ ...proizvod, kolicina: 1 });
    setKorpaProizvodi(prev => [...prev, proizvod]);
  };

  const handleIzbaciIzKorpe = (proizvod) => {
    ukloniIzKorpe(proizvod.id);
    setKorpaProizvodi(prev => prev.filter(item => item.id !== proizvod.id));
  };

  const isProizvodUKorpi = (id) => korpaProizvodi.some(proizvod => proizvod.id === id);

  const sortiraniProizvodi = [...proizvodi].sort((a, b) => {
    return sortOrder === "asc" ? a.cena - b.cena : b.cena - a.cena;
  });

  const categories = ['Sve', ...new Set(proizvodi.map(proizvod => proizvod.kategorija || 'Ostalo'))];

  const filtriraniProizvodi = sortiraniProizvodi.filter(proizvod => {
    const matchesSearch = proizvod.ime.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         proizvod.opis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Sve' || proizvod.kategorija === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="proizvodi-container">
      
      <header className="proizvodi-header">
        <h1 className="proizvodi-title">Naši Proizvodi</h1>
        <p className="proizvodi-subtitle">Pronađite najbolje proizvode po najpovoljnijim cenama</p>
      </header>

      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Pretraži proizvode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>

        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="sortiranje-container">
          <button 
            onClick={() => setSortOrder("asc")} 
            className={`sortiraj-btn ${sortOrder === 'asc' ? 'active' : ''}`}
          >
            Cena ↓↑
          </button>
          <button 
            onClick={() => setSortOrder("desc")} 
            className={`sortiraj-btn ${sortOrder === 'desc' ? 'active' : ''}`}
          >
            Cena ↑↓
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Učitavanje proizvoda...</p>
        </div>
      ) : (
        <div className="products-grid">
          {filtriraniProizvodi.length > 0 ? (
            filtriraniProizvodi.map((proizvod) => (
              <div 
                key={proizvod.id} 
                className={`product-card ${isProizvodUKorpi(proizvod.id) ? 'in-cart' : ''}`}
              >
                <div className="product-image-container">
                  <img 
                    src={proizvod.slika || 'default-image.png'} 
                    alt={proizvod.ime} 
                    className="product-image"
                    onError={(e) => (e.target.src = 'default-image.png')}
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{proizvod.ime}</h3>
                  <p className="product-description">{proizvod.opis}</p>
                  <div className="product-price-container">
                    <span className="product-price">{proizvod.cena} RSD</span>
                  </div>
                  <div className="product-actions">
                    <button
                      onClick={() => handleViseOProizvodu(proizvod)}
                      className="proizvod-vise-btn"
                    >
                      <i className="fas fa-info-circle"></i> Detalji
                    </button>
                    {isProizvodUKorpi(proizvod.id) ? (
                      <button
                        onClick={() => handleIzbaciIzKorpe(proizvod)}
                        className="proizvod-izbaci-btn"
                      >
                        <i className="fas fa-trash-alt"></i> Izbaci
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDodajUKorpu(proizvod)}
                        className="proizvod-dodaj-btn"
                      >
                        <i className="fas fa-cart-plus"></i> Dodaj
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <i className="fas fa-exclamation-circle"></i>
              <p>Nema rezultata za vašu pretragu</p>
            </div>
          )}
        </div>
      )}

      {/* Floating cart button */}
      {korpaProizvodi.length > 0 && (
        <div className="floating-cart-btn" onClick={() => navigate("/korpa")}>
          <i className="fas fa-shopping-cart"></i>
          <span className="cart-count">{korpaProizvodi.length}</span>
        </div>
      )}
    </div>
  );
};

export default Proizvodi;
