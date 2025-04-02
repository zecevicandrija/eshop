import React, { useState, useEffect } from "react";
import "./MojProfil.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faHistory,
  faStar,
  faLink,
  faHeadset,
  faHeart,
  faCog,
  faEnvelope,
  faGamepad,
  faDollarSign,
  faTrophy,
  faUsers,
  faBell,
  faSignOutAlt,
  faTrash,
  faUserTie,
  faStar as solidStar,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useWishlist } from './WishlistContext';
import { useAuth } from '../login/auth';
import axios from 'axios';
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

const MojProfil = () => {
  const [selectedSection, setSelectedSection] = useState("keys");
  const { wishlist, loading, error, fetchWishlist, ukloniIzListeZelja } = useWishlist();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && user.id) {
      fetchWishlist(user.id);
    }
  }, [fetchWishlist, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedSection]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post(`http://localhost:5000/api/korisnici/upload-avatar/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Ažuriranje korisnika u AuthContext-u nakon uploada
      const updatedUser = { ...user, profilna: response.data.url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload(); // Privremeno rešenje, bolje koristiti setUser iz AuthContext-a
    } catch (err) {
      console.error('Greška pri uploadu slike:', err);
      alert('Greška pri uploadu slike');
    }
  };

  const sections = {
    keys: <KeysSection />,
    orders: <OrdersSection />,
    reviews: <ReviewsSection />,
    affiliate: <AffiliateSection />,
    support: <SupportSection />,
    wishlist: <WishlistSection wishlist={wishlist} loading={loading} error={error} ukloniIzListeZelja={ukloniIzListeZelja} korisnikId={user?.id} />,
    settings: <SettingsSection />,
    achievements: <AchievementsSection />,
    friends: <FriendsSection />,
    notifications: <NotificationsSection />,
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-inner">
          <div className="profile-picture-container">
            <img
              src={user?.profilna || "profile-picture.jpg"} // Ako nema slike, koristi podrazumevanu
              alt="Profile Picture"
              className="profile-picture"
              onClick={() => document.getElementById('avatarInput').click()} // Klik za upload
            />
            <input
              type="file"
              id="avatarInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>
          <div className="user-info">
            <h1 className="username">{user ? `${user.ime} ${user.prezime}` : "Nepoznat korisnik"}</h1>
            <p>
              <FontAwesomeIcon icon={faEnvelope} /> {user ? user.email : "Nema email adrese"}
            </p>
            <p>
              <FontAwesomeIcon icon={faGamepad} /> Igre: 25
            </p>
            <p>
              <FontAwesomeIcon icon={faDollarSign} /> Potrošeno: $450
            </p>
            <p>
              <FontAwesomeIcon icon={faTrophy} /> Nivo: 12
            </p>
          </div>
          <button className="logout-button" onClick={logout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Odjava
          </button>
        </div>
      </header>

      {/* Navigacija */}
      <nav className="profile-nav">
        <ul>
          <li>
          <a
        href="#keys"
        onClick={(e) => {
          e.preventDefault();
          setSelectedSection("keys");
        }}
              className={selectedSection === "keys" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faKey} /> Moji ključevi
            </a>
          </li>
          <li>
          <a
        href="#orders"
        onClick={(e) => {
          e.preventDefault();
          setSelectedSection("orders");
        }}
              className={selectedSection === "orders" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faHistory} /> Istorija narudžbina
            </a>
          </li>
          <li>
          <a
        href="#reviews"
        onClick={(e) => {
          e.preventDefault();
          setSelectedSection("reviews");
        }}
              className={selectedSection === "reviews" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faStar} /> Recenzije
            </a>
          </li>
          <li>
          <a
        href="#affiliate"
        onClick={(e) => {
          e.preventDefault();
          setSelectedSection("affiliate");
        }}
              className={selectedSection === "affiliate" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faLink} /> Affiliate
            </a>
          </li>
          <li>
          <a
        href="#support"
        onClick={(e) => {
          e.preventDefault();
          setSelectedSection("support");
        }}
              className={selectedSection === "support" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faHeadset} /> Podrška
            </a>
          </li>
          <li>
          <a
        href="#wishlist"
        onClick={(e) => {
          e.preventDefault();
          setSelectedSection("wishlist");
        }}
              className={selectedSection === "wishlist" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faHeart} /> Lista želja
            </a>
          </li>
          <li>
          <a
        href="#settings"
        onClick={(e) => {
          e.preventDefault();
          setSelectedSection("settings");
        }}
              className={selectedSection === "settings" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faCog} /> Podešavanja
            </a>
          </li>
          <li>
          <a
        href="#achievements"
        onClick={(e) => {
          e.preventDefault();
          setSelectedSection("achievements");
        }}
              className={selectedSection === "achievements" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faTrophy} /> Dostignuća
            </a>
          </li>
          <li>
          <a
        href="#friends"
        onClick={(e) => {
          e.preventDefault();
          setSelectedSection("friends");
        }}
              className={selectedSection === "friends" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faUsers} /> Prijatelji
            </a>
          </li>
          <li>
          <a
        href="#notifications"
        onClick={(e) => {
          e.preventDefault();
          setSelectedSection("notifications");
        }}
              className={selectedSection === "notifications" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faBell} /> Obaveštenja
            </a>
          </li>
          {user && user.uloga === 'admin' && (
          <li>
          <a
        href="/adminproizvodi"
              className={selectedSection === "" ? "active" : ""}
            >
              <FontAwesomeIcon icon={faUserTie} /> Admin
            </a>
          </li>
          )}
        </ul>
      </nav>

      {/* Glavni sadržaj */}
      <main className="profile-content">{sections[selectedSection]}</main>
    </div>
  );
};

// Ažurirana WishlistSection komponenta
const WishlistSection = ({ wishlist, loading, error, ukloniIzListeZelja, korisnikId }) => {
  if (loading) return <p>Učitavanje liste želja...</p>;
  if (error) return <p>Greška: {error}</p>;

  return (
    <section id="wishlist" className="section">
      <h2>Lista želja</h2>
      {wishlist.length === 0 ? (
        <p>Vaša lista želja je prazna.</p>
      ) : (
        <div className="wishlist-list">
          {wishlist.map((proizvod) => (
            <div key={proizvod.id} className="wishlist-item">
              <img src={proizvod.slika} alt={proizvod.ime} />
              <div>
                <p>{proizvod.ime}</p>
                <p>{proizvod.cena} RSD</p>
              </div>
              <button onClick={() => ukloniIzListeZelja(proizvod.id, korisnikId)}>
                <FontAwesomeIcon icon={faTrash} /> Ukloni
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// Ostale sekcije ostaju nepromenjene
// MojProfil.js

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/transakcije/by-email/${user.email}`);
        console.log('Transakcije:', response.data);
        const ordersWithPreporuke = await Promise.all(
          response.data.map(async (order) => {
            const kupljeniIds = order.proizvodi.map((p) => p.id);
            const preporukeResponse = await axios.get(`http://localhost:5000/api/preporuke/multiple`, {
              params: { ids: kupljeniIds.join(',') },
            });
            console.log('Preporuke za narudžbinu:', preporukeResponse.data);
            return { ...order, preporuke: preporukeResponse.data };
          })
        );
        setOrders(ordersWithPreporuke);
        setLoading(false);
      } catch (err) {
        console.error('Greška:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchOrders();
    }
  }, [user]);

  if (loading) return <p>Učitavanje narudžbina...</p>;
  if (error) return <p>Greška: {error}</p>;

  return (
    <section id="orders" className="section">
      <h2>Istorija narudžbina</h2>
      <div className="orders-list">
        {orders.length === 0 ? (
          <p>Nema narudžbina.</p>
        ) : (
          orders.map((order) => {
            const total = order.proizvodi.reduce(
              (acc, proizvod) => acc + proizvod.cena,
              0
            );
            return (
              <div key={order.id} className="order-item">
                <p>Narudžbina #{order.id}</p>
                <p>Datum: {new Date(order.datum_transakcije).toLocaleDateString()}</p>
                <p>Ukupno: {total} RSD</p>
                <p>Status: {order.status || 'Na čekanju'}</p>
                <button className="details-button">Detalji</button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

const KeysSection = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/transakcije/by-email/${user.email}`
        );
        setTransactions(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchTransactions();
    }
  }, [user]);

  if (loading) return <p>Učitavanje ključeva...</p>;
  if (error) return <p>Greška: {error}</p>;

  return (
    <section id="keys" className="section">
      <h2>Moji ključevi</h2>
      <div className="keys-list">
        {transactions.length === 0 ? (
          <p>Nema aktivnih ključeva.</p>
        ) : (
          transactions.flatMap((transaction) =>
            transaction.proizvodi.map((proizvod, index) => (
              <div key={`${transaction.id}-${index}`} className="key-item">
                <p>Igra: {proizvod.ime}</p>
                <p>Ključ: XXXXX-XXXXX-XXXXX</p>
                <p>Datum: {new Date(transaction.datum_transakcije).toLocaleDateString()}</p>
              </div>
            ))
          )
        )}
      </div>
    </section>
  );
};


// Komponenta za prikaz zvezdica (i za unos)
const RatingStars = ({ rating, onRatingChange, interactive = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={`proizvod-rating ${interactive ? 'interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = interactive ? (hoverRating || rating) >= star : rating >= star;
        return (
          <FontAwesomeIcon
            icon={isActive ? solidStar : regularStar}
            key={star}
            className={`proizvod-star ${isActive ? 'proizvod-star-filled' : ''} ${interactive ? 'interactive-star' : ''}`}
            onClick={() => interactive && onRatingChange(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        );
      })}
      {interactive && rating > 0 && (
        <button onClick={() => onRatingChange(0)} className="clear-rating-btn">Poništi</button>
      )}
    </div>
  );
};

const ReviewsSection = () => {
  const [recenzije, setRecenzije] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Stanja za uređivanje recenzije
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingRating, setEditingRating] = useState(0);
  const [editingText, setEditingText] = useState("");
  const [editError, setEditError] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const fetchRecenzije = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/recenzije/korisnik/${user.id}`);
        setRecenzije(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchRecenzije();
  }, [user]);

  const handleEditClick = (review) => {
    setEditingReviewId(review.id);
    setEditingRating(review.ocena);
    setEditingText(review.tekst || "");
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditingRating(0);
    setEditingText("");
    setEditError(null);
  };

  const handleSaveEdit = async (reviewId) => {
    if (editingRating < 1 || editingRating > 5) {
      setEditError("Ocena mora biti između 1 i 5.");
      return;
    }
    setSavingEdit(true);
    try {
      // Pretpostavljamo da postoji endpoint za update: PUT /api/recenzije/{id}
      const response = await axios.put(`http://localhost:5000/api/recenzije/${reviewId}`, {
        ocena: editingRating,
        tekst: editingText
      });
      // Ažuriraj recenzije u stanju
      setRecenzije(prev => prev.map(r => r.id === reviewId ? response.data : r));
      setEditingReviewId(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Greška pri čuvanju izmena.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) return <p>Učitavanje recenzija...</p>;
  if (error) return <p>Greška: {error}</p>;

  return (
    <section id="reviews" className="section">
      <h2>Recenzije</h2>
      <div className="reviews-list">
        {recenzije.length === 0 ? (
          <p>Još uvek niste napisali recenzije.</p>
        ) : (
          recenzije.map((recenzija) => (
            <div key={recenzija.id} className="review-item">
              <div className="review-header">
                <img
                  src={recenzija.proizvod_slika || 'default-image.png'}
                  alt={recenzija.proizvod_ime}
                  className="review-product-image"
                />
                <h3>{recenzija.proizvod_ime}</h3>
                {editingReviewId !== recenzija.id && (
                  <button className="edit-review-btn" onClick={() => handleEditClick(recenzija)}>
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                )}
              </div>
              {editingReviewId === recenzija.id ? (
                <div className="edit-review-form">
                  <div className="form-group rating-group">
                    <label>Vaša ocena:</label>
                    <RatingStars rating={editingRating} onRatingChange={setEditingRating} interactive={true} />
                  </div>
                  <div className="form-group">
                    <label>Vaš komentar (opciono):</label>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows="4"
                    />
                  </div>
                  {editError && <p className="error-message">{editError}</p>}
                  <button onClick={() => handleSaveEdit(recenzija.id)} disabled={savingEdit}>
                    {savingEdit ? "Čuvanje..." : "Sačuvaj"}
                  </button>
                  <button onClick={handleCancelEdit}>Otkaži</button>
                </div>
              ) : (
                <>
                  <RatingStars rating={recenzija.ocena} />
                  <p className="review-date">
                    {new Date(recenzija.datum_kreiranja).toLocaleDateString('sr-RS')}
                  </p>
                  {recenzija.tekst && <p className="review-text">{recenzija.tekst}</p>}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

const AffiliateSection = () => (
  <section id="affiliate" className="section">
    <h2>Affiliate Program</h2>
    <div className="affiliate-stats">
      <p>Zarađeno: $150</p>
      <p>Klikovi: 300</p>
      <p>Link: https://gaming.com/ref/user123</p>
    </div>
  </section>
);

const SupportSection = () => (
  <section id="support" className="section">
    <h2>Podrška</h2>
    <button className="new-ticket-button">Otvori novi tiket</button>
    <div className="tickets-list">
      <div className="ticket-item">
        <p>Tiket #987</p>
        <p>Problem: Povrat novca</p>
        <p>Status: Otvoren</p>
      </div>
    </div>
  </section>
);

const SettingsSection = () => (
  <section id="settings" className="section">
    <h2>Podešavanja</h2>
    <div className="settings-form">
      <label>Promeni lozinku:</label>
      <input type="password" placeholder="Nova lozinka" />
      <label>Profilna slika:</label>
      <input type="file" />
      <label>2FA:</label>
      <input type="checkbox" /> Omogući dvofaktorsku autentifikaciju
      <button>Sačuvaj</button>
    </div>
  </section>
);

const AchievementsSection = () => (
  <section id="achievements" className="section">
    <h2>Dostignuća</h2>
    <div className="achievements-list">
      <div className="achievement-item">
        <FontAwesomeIcon icon={faTrophy} className="achievement-icon" />
        <div>
          <p>Master Gamer</p>
          <p>Kupi 20 igara</p>
        </div>
      </div>
      <div className="achievement-item locked">
        <FontAwesomeIcon icon={faTrophy} className="achievement-icon" />
        <div>
          <p>Legend</p>
          <p>Potroši $1000 (Zaključano)</p>
        </div>
      </div>
    </div>
  </section>
);

const FriendsSection = () => (
  <section id="friends" className="section">
    <h2>Prijatelji</h2>
    <div className="friends-list">
      <div className="friend-item">
        <img src="friend1.jpg" alt="Friend 1" className="friend-avatar" />
        <div>
          <p>Friend1</p>
          <p>Status: Online</p>
        </div>
      </div>
      <div className="friend-item">
        <img src="friend2.jpg" alt="Friend 2" className="friend-avatar" />
        <div>
          <p>Friend2</p>
          <p>Status: Offline</p>
        </div>
      </div>
    </div>
  </section>
);

const NotificationsSection = () => (
  <section id="notifications" className="section">
    <h2>Obaveštenja</h2>
    <div className="notifications-list">
      <div className="notification-item unread">
        <p>Nova igra na popustu!</p>
        <p>Datum: 2023-05-01</p>
      </div>
      <div className="notification-item">
        <p>Narudžbina #12345 isporučena.</p>
        <p>Datum: 2023-04-28</p>
      </div>
    </div>
  </section>
);

export default MojProfil;