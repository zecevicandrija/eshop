import React from 'react';
import Navbar from './Navbar';
import slika2 from '../Slike/slika2.jpg';
import slika3 from '../Slike/slika3.png';
import slika4 from '../Slike/slika4.jpg';
import boostpng from '../Slike/boostpng.png';
import './Pocetna.css';

const Pocetna = () => {
  return (
    <div className='pocetna'>
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
        <h2 className="trending-title">Trending <span className="arrow">→</span></h2>
        <div className="game-list">
          <div className="game-card">
            <div className="game-image" style={{ backgroundImage: `url(${slika2})` }}></div>
            <div className="game-info">
              <span className="discount-badge">-28%</span>
              <h3 className="game-title">Ghost of Tsushima</h3>
              <span className="game-price">5912.61 RSD</span>
            </div>
          </div>
          <div className="game-card">
            <div className="game-image" style={{ backgroundImage: `url(${slika3})` }}></div>
            <div className="game-info">
              <span className="discount-badge">-25%</span>
              <h3 className="game-title">EuroTruck SVI DLC</h3>
              <span className="game-price">3519.86 RSD</span>
              <span className="game-dlc">DLC</span>
            </div>
          </div>
          <div className="game-card">
            <div className="image-hover" style={{ backgroundImage: `url(${boostpng})` }}></div>
            <div className="game-image" style={{ backgroundImage: `url(${slika4})` }}></div>
            <div className="game-info">
              <span className="discount-badge">-28%</span>
              <h3 className="game-title">Discord Server LVL 3 BOOST</h3>
              <span className="game-price">2500 RSD</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-trust">
  <div className="features-container">
    <div className="features-grid">
      <div className="feature-card">
        <h3>Super fast</h3>
        <p>Instant digital download</p>
      </div>
      <div className="feature-card">
        <h3>Reliable & safe</h3>
        <p>Over 10,000 games</p>
      </div>
      <div className="feature-card">
        <h3>Customer support</h3>
        <p>Nursian support 24/7</p>
      </div>
    </div>
    <div className="trustpilot-wrapper">
      <div className="trustpilot-card">
        <div className="trustpilot-content">
          <span className="stars">★★★★★</span>
          <div className="trustpilot-info">
            <span className="trustscore">TrustScore 4.7</span>
            <span className="reviews">78,840 reviews</span>
          </div>
        </div>
        <img src={''} alt="Trustpilot" className="trustpilot-logo"/>
      </div>
    </div>
  </div>
</section>
    </div>
  );
};

export default Pocetna;
