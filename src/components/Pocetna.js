import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../login/auth';
import slika2 from '../Slike/slika2.jpg';
import slika3 from '../Slike/slika3.png';
import slika4 from '../Slike/slika4.jpg';
import boostpng from '../Slike/boostpng.png';
import tsushima from '../Slike/tsushima.mp4';
import './Pocetna.css';

const Pocetna = () => {
  const featureCards = [
    { title: 'Super fast', description: 'Instant digital download' },
    { title: 'Reliable & safe', description: 'Over 10,000 games' },
    { title: 'Customer support', description: 'Nursian support 24/7' },
  ];

  const [preporuke, setPreporuke] = useState([]);
  const { user } = useAuth(); // Dohvatamo trenutnog korisnika iz AuthContext

  useEffect(() => {
    const fetchPreporuke = async () => {
      if (user) { // Proveravamo da li je korisnik prijavljen
        try {
          const response = await axios.get(`http://localhost:5000/api/preporuke/korisnik/${user.id}`);
          console.log('API odgovor:', response.data);
          setPreporuke(response.data);
        } catch (error) {
          console.error('Greška pri dobavljanju preporuka:', error);
        }
      } else {
        console.log('Korisnik nije prijavljen, preporuke se ne dohvaćaju.');
      }
    };
    fetchPreporuke();
  }, [user]); // useEffect se pokreće kada se promeni stanje korisnika

  return (
    <div className="pocetna">
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <div className="hero-image" style={{ backgroundImage: `url(${slika2})` }}></div>
        <div className="hero-overlay">
          <h1 className="hero-title">Monster Hunter Wilds</h1>
          <div className="hero-price">
            <span className="discount-badge">-28%</span>
            <span className="price">5912.61 RSD</span>
          </div>
        </div>
      </section>

      {/* Trending Games Section */}
      <section className="trending">
        <h2 className="trending-title">
          Trending <span className="arrow">→</span>
        </h2>
        <div className="game-list">
          <div className="game-card">
            <div className="game-image" style={{ position: 'relative' }}>
              <img
                src={slika2}
                alt="game"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '10px',
                }}
              />
              <video
                src={tsushima}
                autoPlay
                loop
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            </div>
            <div className="game-info">
              <span className="discount-badge">-28%</span>
              <h3 className="game-title">Ghost of Tsushima</h3>
              <span className="game-price">5000 RSD</span>
            </div>
          </div>

          <div className="game-card">
            <div className="game-image" style={{ backgroundImage: `url(${slika3})` }}></div>
            <div className="game-info">
              <span className="discount-badge">-25%</span>
              <h3 className="game-title">EuroTruck SVI DLC</h3>
              <span className="game-price">3000 RSD</span>
              <span className="game-dlc">DLC</span>
            </div>
          </div>
          <div className="game-card">
            <div className="game-image" style={{ backgroundImage: `url(${slika4})` }}></div>
            <div className="game-info">
              <span className="discount-badge">-28%</span>
              <h3 className="game-title">Discord Server LVL 3 BOOST</h3>
              <span className="game-price">3000 RSD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Games Section */}
      <section className="trending">
        <h2 className="trending-title">
          Preporuke <span className="arrow">→</span>
        </h2>
        <div className="game-list">
          {user ? ( // Ako je korisnik prijavljen
            preporuke.length > 0 ? (
              preporuke.map((proizvod) => (
                <div key={proizvod.id} className="game-card">
                  <div className="game-image" style={{ backgroundImage: `url(${proizvod.slika})` }}></div>
                  <div className="game-info">
                    <h3 className="game-title">{proizvod.ime}</h3>
                    <span className="game-price">{proizvod.cena} RSD</span>
                  </div>
                </div>
              ))
            ) : (
              <p>Nema preporuka za prikaz.</p>
            )
          ) : (
            <p>Morate biti prijavljeni da vidite preporuke.</p> // Poruka za neprijavljene korisnike
          )}
        </div>
      </section>

      <section className="features-trust">
        <div className="features-container">
          <div className="features-grid">
            {[...featureCards, ...featureCards].map((card, index) => (
              <div className="feature-card" key={index}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pocetna;