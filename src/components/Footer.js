import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Pomoć</h3>
          <ul>
            <li><a href="/terms">Terms of Use</a></li>
            <li><a href="/privacy">Politika Privatnosti</a></li>
            <li><a href="/affiliate">Affiliate Program</a></li>
            <li><a href="/contact">Kontakt</a></li>
            <li><a href="/giftcard">Gift Card</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Društvene Mreže</h3>
          <div className="social-icons">
            <a href="https://www.instagram.com/" className="social-icon" aria-label="Instagram">
              <span className="instagram-icon">📷</span>
            </a>
            <a href="https://www.facebook.com/" className="social-icon" aria-label="Facebook">
              <span className="facebook-icon">📘</span>
            </a>
            <a href="https://www.twitter.com/" className="social-icon" aria-label="Twitter">
              <span className="twitter-icon">🐦</span>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>O Nama</h3>
          <p>Digital products and keys e-commerce platform offering a wide range of software, games, and digital content.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-creator">
            Made by <a href="https://github.com/zecevicandrija" target="_blank" rel="noopener noreferrer">zecevic147@gmail.com</a>
          </div>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} BalkanKeys. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;