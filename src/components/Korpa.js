import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Korpa.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faArrowLeft,
  faTicketAlt,
  faShoppingCart,
  faCreditCard
} from "@fortawesome/free-solid-svg-icons";

const Korpa = ({ korpa, ukloniIzKorpe, isprazniKorpu }) => {
  const [proizvodi, setProizvodi] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProizvodi = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/proizvodi");
        const dostupniProizvodi = response.data;
        const updatedProizvodi = korpa.map((proizvod) => {
          const dostupniProizvod = dostupniProizvodi.find(
            (p) => p.id === proizvod.id
          );
          return {
            ...proizvod,
            dostupnaKolicina: dostupniProizvod ? dostupniProizvod.kolicina : 0,
            slika: dostupniProizvod ? dostupniProizvod.slika : null
          };
        });
        setProizvodi(updatedProizvodi);
      } catch (error) {
        console.error(
          "Greška prilikom preuzimanja podataka o proizvodima:",
          error
        );
      }
    };

    fetchProizvodi();
  }, [korpa]);

  const handleRemove = (id) => {
    ukloniIzKorpe(id);
  };

  const handleIzabranaKolicina = (id, event) => {
    const novaKolicina = parseInt(event.target.value, 10);
    setProizvodi((prevProizvodi) =>
      prevProizvodi.map((proizvod) =>
        proizvod.id === id ? { ...proizvod, kolicina: novaKolicina } : proizvod
      )
    );
  };

  const handleDiscountCode = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/popusti`);
      const discountList = response.data;
      const discount = discountList.find((d) => d.ime_popusta === discountCode);

      if (discount) {
        setDiscountPercentage(discount.procenat);
        alert(`Popust od ${discount.procenat}% je primenjen.`);
      } else {
        setDiscountPercentage(0);
        alert("Kod za popust nije pronađen.");
      }
    } catch (error) {
      console.error("Greška pri preuzimanju popusta:", error);
      setDiscountPercentage(0);
    } finally {
      setLoading(false);
    }
  };

  const ukupnaCena = proizvodi.reduce((total, proizvod) => {
    return total + proizvod.cena * proizvod.kolicina;
  }, 0);

  const ukupnaCenaSaPopustom = ukupnaCena * (1 - discountPercentage / 100);

  const formatProizvodi = proizvodi.map(({ id, ime, cena, kolicina }) => ({
    id,
    ime,
    cena,
    kolicina,
  }));

  return (
    <div className="korpa-page-container">
      <div className="korpa-header-container">
        <button className="korpa-back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Nazad
        </button>
        <h1 className="korpa-main-title">
          <FontAwesomeIcon icon={faShoppingCart} /> Vaša Korpa
        </h1>
      </div>

      <div className="korpa-content-container">
        <div className="korpa-items-section">
          {proizvodi.length === 0 ? (
            <div className="korpa-empty-message">
              <h2>Vaša korpa je prazna</h2>
              <p>Dodajte proizvode kako biste nastavili</p>
              <button 
                className="korpa-browse-button"
                onClick={() => navigate('/proizvodi')}
              >
                Pregledaj proizvode
              </button>
            </div>
          ) : (
            <div className="korpa-items-list">
              {proizvodi.map((proizvod) => (
                <div key={proizvod.id} className="korpa-item-card">
                  <div className="korpa-item-image-container">
                    <img 
                      src={proizvod.slika || 'default-image.png'} 
                      alt={proizvod.ime} 
                      className="korpa-item-image"
                      onError={(e) => (e.target.src = 'default-image.png')}
                    />
                  </div>
                  <div className="korpa-item-details">
                    <h3 className="korpa-item-name">{proizvod.ime}</h3>
                    <div className="korpa-item-price">{proizvod.cena} RSD</div>
                    <div className="korpa-item-quantity-controls">
                      <label>Količina:</label>
                      <input
                        type="number"
                        min="1"
                        max={proizvod.dostupnaKolicina}
                        value={proizvod.kolicina}
                        onChange={(event) => handleIzabranaKolicina(proizvod.id, event)}
                        className="korpa-quantity-input"
                      />
                    </div>
                  </div>
                  <div className="korpa-item-actions">
                    <button
                      className="korpa-remove-item-button"
                      onClick={() => handleRemove(proizvod.id)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} /> Ukloni
                    </button>
                    <div className="korpa-item-total">
                      {proizvod.cena * proizvod.kolicina} RSD
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {proizvodi.length > 0 && (
          <div className="korpa-summary-section">
            <div className="korpa-summary-card">
              <h3 className="korpa-summary-title">Sažetak porudžbine</h3>
              
              <div className="korpa-discount-container">
                <div className="korpa-discount-input-container">
                  <FontAwesomeIcon icon={faTicketAlt} className="korpa-discount-icon" />
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Unesite kod za popust"
                    className="korpa-discount-input"
                  />
                </div>
                <button
                  className="korpa-apply-discount-button"
                  onClick={handleDiscountCode}
                  disabled={loading}
                >
                  {loading ? "Proveravam..." : "Primeni popust"}
                </button>
              </div>

              <div className="korpa-total-container">
                <div className="korpa-total-row">
                  <span>Ukupna vrednost:</span>
                  <span>{ukupnaCena} RSD</span>
                </div>
                {discountPercentage > 0 && (
                  <div className="korpa-total-row korpa-discount-row">
                    <span>Popust ({discountPercentage}%):</span>
                    <span>-{(ukupnaCena * discountPercentage / 100).toFixed(2)} RSD</span>
                  </div>
                )}
                <div className="korpa-total-row korpa-grand-total">
                  <span>Ukupno za plaćanje:</span>
                  <span>{ukupnaCenaSaPopustom.toFixed(2)} RSD</span>
                </div>
              </div>

              <button
                className="korpa-checkout-button"
                onClick={() =>
                  navigate("/checkout", {
                    state: {
                      proizvodi: formatProizvodi,
                      ukupnaCena: ukupnaCena,
                      ukupnaCenaSaPopustom,
                    },
                  })
                }
              >
                <FontAwesomeIcon icon={faCreditCard} /> Nastavi na plaćanje
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Korpa;
