import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../login/auth';
import './Navbar.css';

const Navbar = () => {
  const [isNavActive1, setIsNavActive1] = useState(false);
  const { user, logout } = useAuth();

  // Ako korisnik nije ulogovan, link vodi na /login, a u suprotnom na /profil
  const profileLink = user ? "/profil" : "/login";

  const toggleNav1 = () => {
    setIsNavActive1(!isNavActive1);
  };

  return (
    <header className="navbar1">
      <div className="navbar-container1">
        <div className="logo1">
          <Link to="/">
            <span className="logo-text1">
              Balkan<span className="logo-text-orange1">Keys</span>
            </span>
          </Link>
        </div>

        {/* Platform buttons (center) */}
        <div className={`platform-buttons1 ${isNavActive1 ? 'active1' : ''}`}>
          <Link to="/proizvodi" className="platform-btn1 pc1">
            <span className="platform-text1">Proizvodi</span>
          </Link>
          <button className="search-btn1">
            <span className="search-icon1"></span>
          </button>
        </div>

        {/* User actions (right) */}
        <div className="user-actions1">
          <Link to="/korpa" className="cart-btn1">
            <span className="cart-icon1"></span>
          </Link>
          {/* Koristi profileLink umjesto statičkog "/profil" */}
          <Link to={profileLink} className="profile-btn1">
            <span className="profile-icon1"></span>
          </Link>

          {/* Hamburger menu (mobile) */}
          <div className="menu-toggle1" onClick={toggleNav1}>
            <span className="bar1"></span>
            <span className="bar1"></span>
            <span className="bar1"></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
