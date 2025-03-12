import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../login/auth'; // Uvoz useAuth za dobijanje informacija o korisniku
import './Navbar.css';

const Navbar = () => {
  const [isNavActive, setIsNavActive] = useState(false);
  const { user, logout } = useAuth(); // Dohvatanje korisničkih informacija i logout funkcije

  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  return (
    <header className="navbar">
      <div className="navbar-content">
        
        {/* Logo (levo) */}
        <div className="logo">
          <Link to="/">
            <span className="logo-icon">▶</span>
            <span className="logo-text">
              Balkan<span className="logo-text-orange">Keys</span>
            </span>
          </Link>
        </div>

        {/* Glavni linkovi (u sredini) */}
        <div className={`nav-links ${isNavActive ? 'active' : ''}`}>
          <ul>
            <li><Link to="/">Početna</Link></li>
            <li><Link to="/proizvodi">Proizvodi</Link></li>
            <li><Link to="/korpa">Korpa</Link></li>
            {user && user.uloga === 'admin' && (
              <>
                <li><Link to="/dodaj-proizvod">Dodaj Proizvod</Link></li>
                <li><Link to="/adminproizvodi">Admin</Link></li>
              </>
            )}
            {user && user.uloga === 'kupac' && (
              <li><Link to="/transakcije">Moje Transakcije</Link></li>
            )}
            {!user ? (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Signup</Link></li>
              </>
            ) : (
              <li>
                <button onClick={logout} className="logout-button">
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Ikonice (desno) */}
        <div className="user-actions">
          {/* Cart ikonica */}
          <Link to="/korpa" className="cart-button">
            <span className="cart-icon">🛒</span>
            <span className="cart-dot"></span>
          </Link>
          {/* Profil ikonica */}
          <button className="profile-button">👤</button>

          {/* Hamburger (za mobilni prikaz) */}
          <div className="menu-toggle" onClick={toggleNav}>
            &#9776;
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
