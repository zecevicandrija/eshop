import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProizvodDetalji.css';
import { useWishlist } from '../Profil/WishlistContext.js';
import { useAuth } from '../login/auth.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faHeart,
    faShoppingCart,
    faStar as solidStar,
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

// Komponenta za prikaz zvezdica (koristi se i za prikaz i za unos)
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

const ProizvodDetalji = ({ dodajUKorpu }) => {
    const { state: proizvod } = useLocation();
    const navigate = useNavigate();
    const { dodajUListuZelja, wishlist } = useWishlist();
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);

    // State za recenzije
    const [recenzije, setRecenzije] = useState([]);
    const [loadingRecenzije, setLoadingRecenzije] = useState(true);
    const [errorRecenzije, setErrorRecenzije] = useState(null);

    // State za proveru da li korisnik može ostaviti recenziju
    const [mozeOstavitiRecenziju, setMozeOstavitiRecenziju] = useState(false);
    const [loadingProveraKupovine, setLoadingProveraKupovine] = useState(false);
    const [vecOcenio, setVecOcenio] = useState(false); // Da li je korisnik već ocenio

    // State za unos nove recenzije
    const [novaOcena, setNovaOcena] = useState(0); // 0 znači da nije odabrana ocena
    const [noviTekst, setNoviTekst] = useState('');
    const [submittingRecenzija, setSubmittingRecenzija] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // --- EFEKTI ---

    // Dohvatanje recenzija i provera da li je korisnik već ocenio proizvod
    useEffect(() => {
        if (proizvod?.id) {
            setLoadingRecenzije(true);
            setErrorRecenzije(null);
            axios.get(`http://localhost:5000/api/recenzije/${proizvod.id}`)
                .then(response => {
                    setRecenzije(response.data);
                    // Provera da li je korisnik već ocenio proizvod
                    if (user) {
                        const userReview = response.data.find(r => r.korisnik_id === user.id);
                        setVecOcenio(!!userReview); // Postavi na true ako postoji recenzija
                    } else {
                        setVecOcenio(false);
                    }
                })
                .catch(error => {
                    console.error("Greška pri dohvatanju recenzija:", error);
                    setErrorRecenzije("Nije moguće učitati recenzije.");
                })
                .finally(() => {
                    setLoadingRecenzije(false);
                });
            
            // Ako je korisnik ulogovan, proveri da li je kupio proizvod
            if (user) {
                setLoadingProveraKupovine(true);
                axios.get(`http://localhost:5000/api/recenzije/provera-kupovine/${user.id}/${proizvod.id}`)
                    .then(response => {
                        setMozeOstavitiRecenziju(response.data.kupio);
                    })
                    .catch(error => {
                        console.error("Greška pri proveri kupovine:", error);
                        setMozeOstavitiRecenziju(false);
                    })
                    .finally(() => {
                        setLoadingProveraKupovine(false);
                    });
            } else {
                setMozeOstavitiRecenziju(false);
            }
        }
    }, [proizvod?.id, user]);

    // --- HANDLERI ---

    const handleDodajUKorpu = () => {
        if (dodajUKorpu) {
            dodajUKorpu({ ...proizvod, kolicina: quantity });
            navigate('/korpa');
        }
    };

    const handleDodajUListuZelja = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        dodajUListuZelja(user.id, proizvod.id);
    };

    const handleDodajRecenziju = (e) => {
        e.preventDefault();
        if (novaOcena === 0 || submittingRecenzija) {
            setSubmitError("Molimo odaberite ocenu (1-5 zvezdica).");
            return;
        }
        if (!user) {
            setSubmitError("Morate biti ulogovani da biste ostavili recenziju.");
            return;
        }

        setSubmittingRecenzija(true);
        setSubmitError(null);

        axios.post('http://localhost:5000/api/recenzije', {
            korisnik_id: user.id,
            proizvod_id: proizvod.id,
            ocena: novaOcena,
            tekst: noviTekst
        })
        .then(response => {
            // Uspešno dodato - dodaj novu recenziju na početak liste i resetuj formu
            setRecenzije([response.data, ...recenzije]);
            setNovaOcena(0);
            setNoviTekst('');
            setMozeOstavitiRecenziju(false); // Korisnik je upravo ocenio, ne može ponovo
            setVecOcenio(true); // Postavi da je ocenio
        })
        .catch(error => {
            console.error("Greška pri slanju recenzije:", error.response?.data?.message || error.message);
            if (error.response?.status === 409) {
                setSubmitError("Već ste ocenili ovaj proizvod.");
                setVecOcenio(true); // Ažuriraj stanje ako backend vrati da je već ocenio
                setMozeOstavitiRecenziju(false);
            } else if (error.response?.status === 403) {
                 setSubmitError("Morate kupiti proizvod da biste ostavili recenziju.");
            } else {
                setSubmitError("Došlo je do greške prilikom slanja recenzije.");
            }
        })
        .finally(() => {
            setSubmittingRecenzija(false);
        });
    };

    const isInWishlist = wishlist.some(item => item.id === proizvod?.id);

    // --- RENDER ---

    if (!proizvod) {
        return (
            <div className="proizvod-not-found-container">
                <h2>Proizvod nije pronađen</h2>
                <button className="proizvod-back-button" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Nazad na proizvode
                </button>
            </div>
        );
    }

    // Izračunaj prosečnu ocenu
    const prosecnaOcena = recenzije.length > 0
        ? recenzije.reduce((sum, r) => sum + r.ocena, 0) / recenzije.length
        : proizvod.ocena || 0;

    const ukupanBrojRecenzija = recenzije.length;

    return (
        <div className="proizvod-detail-container">
            <div className="proizvod-breadcrumb">
                <span onClick={() => navigate('/')}>Početna</span> &gt;
                <span onClick={() => navigate('/proizvodi')}> Proizvodi</span> &gt;
                <span className="proizvod-current">{proizvod.ime}</span>
            </div>

            <div className="proizvod-detail-content">
                <div className="proizvod-gallery">
                    <div className="proizvod-main-image-container">
                        <img
                            src={proizvod.slika || 'default-image.png'}
                            alt={proizvod.ime}
                            className="proizvod-main-image"
                            onError={(e) => (e.target.src = 'default-image.png')}
                        />
                    </div>
                </div>

                <div className="proizvod-info">
                    <div className="proizvod-header">
                        <h1 className="proizvod-title">{proizvod.ime}</h1>
                        <div className="proizvod-meta">
                            <span className="proizvod-category">{proizvod.kategorija || 'Ostalo'}</span>
                            <RatingStars rating={prosecnaOcena} />
                             <span className="proizvod-review-count">({ukupanBrojRecenzija} {ukupanBrojRecenzija === 1 ? 'recenzija' : 'recenzija'})</span>
                        </div>
                    </div>

                    <div className="proizvod-description">
                        <h3>Opis proizvoda</h3>
                        <p>{proizvod.opis}</p>
                    </div>

                    <div className="proizvod-specs">
                        <h3>Specifikacije</h3>
                        <ul>
                            {proizvod.specifikacije?.map((spec, index) => (
                                <li key={index}>
                                    <strong>{spec.naziv}:</strong> {spec.vrednost}
                                </li>
                            )) || <li>Nema dostupnih specifikacija</li>}
                        </ul>
                    </div>
                </div>

                <div className="proizvod-actions">
                    <div className="proizvod-price-container">
                        <div className="proizvod-current-price">{proizvod.cena} RSD</div>
                        {proizvod.staraCena && (
                            <div className="proizvod-old-price">{proizvod.staraCena} RSD</div>
                        )}
                        {proizvod.popust && (
                            <div className="proizvod-discount-badge">-{proizvod.popust}%</div>
                        )}
                    </div>

                    <div className="proizvod-quantity-selector">
                        <label>Količina:</label>
                        <div className="proizvod-quantity-controls">
                            <button
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
                        </div>
                    </div>

                    <div className="proizvod-action-buttons">
                        <button
                            className="proizvod-add-to-cart-btn"
                            onClick={handleDodajUKorpu}
                            disabled={proizvod.kolicina <= 0}
                        >
                            <FontAwesomeIcon icon={faShoppingCart} /> Dodaj u korpu
                        </button>
                        <button
                            className={`proizvod-wishlist-btn ${isInWishlist ? 'proizvod-in-wishlist' : ''}`}
                            onClick={handleDodajUListuZelja}
                        >
                            <FontAwesomeIcon icon={faHeart} /> {isInWishlist ? 'U listi želja' : 'Lista želja'}
                        </button>
                    </div>

                    <div className="proizvod-stock">
                        <div className="proizvod-stock-status">
                            {proizvod.kolicina > 0 ? (
                                <>
                                    <span className="proizvod-in-stock">Dostupno</span>
                                    <span className='proizvod-na-stanju'>({proizvod.kolicina} na stanju)</span>
                                </>
                            ) : (
                                <span className="proizvod-out-of-stock">Nema na stanju</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Sekcija za Recenzije --- */}
            <div className="proizvod-recenzije-container">
                <h2>Recenzije ({ukupanBrojRecenzija})</h2>

                {/* Forma za dodavanje recenzije - prikazuje se samo ako korisnik može ostaviti recenziju i nije već ocenio */}
                {user && mozeOstavitiRecenziju && !vecOcenio && !loadingProveraKupovine && (
                    <div className="dodaj-recenziju-section">
                        <h3>Ostavite Vašu recenziju</h3>
                        <form onSubmit={handleDodajRecenziju} className="recenzija-form">
                            <div className="form-group rating-group">
                                <label>Vaša ocena:</label>
                                <RatingStars rating={novaOcena} onRatingChange={setNovaOcena} interactive={true} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="recenzijaTekst">Vaš komentar (opciono):</label>
                                <textarea
                                    id="recenzijaTekst"
                                    value={noviTekst}
                                    onChange={(e) => setNoviTekst(e.target.value)}
                                    placeholder="Napišite svoje utiske o proizvodu..."
                                    rows="4"
                                />
                            </div>
                            {submitError && <p className="error-message">{submitError}</p>}
                            <button type="submit" className="submit-recenzija-btn" disabled={submittingRecenzija || novaOcena === 0}>
                                {submittingRecenzija ? 'Slanje...' : <> <FontAwesomeIcon icon={faPaperPlane} /> Pošalji recenziju </>}
                            </button>
                        </form>
                    </div>
                )}
                
                {/* Prikaz poruke ako je korisnik već ocenio */}
                {user && vecOcenio && (
                    <p className="info-message">Već ste ocenili ovaj proizvod.</p>
                )}
                
                {/* Prikaz poruke ako korisnik nije kupio proizvod */}
                {user && !mozeOstavitiRecenziju && !vecOcenio && !loadingProveraKupovine && (
                    <p className="info-message">Morate kupiti proizvod da biste ostavili recenziju.</p>
                )}
                
                {/* Prikaz poruke ako korisnik nije ulogovan */}
                {!user && (
                    <p className="info-message">Molimo <span className="login-link" onClick={() => navigate('/login')}>prijavite se</span> da biste ostavili recenziju.</p>
                )}

                {/* Lista postojećih recenzija */}
                <div className="recenzije-lista">
                    {loadingRecenzije && <p>Učitavanje recenzija...</p>}
                    {errorRecenzije && <p className="error-message">{errorRecenzije}</p>}
                    {!loadingRecenzije && recenzije.length === 0 && (
                        <p>Još uvek nema recenzija za ovaj proizvod.</p>
                    )}
                    {!loadingRecenzije && recenzije.map(recenzija => (
                        <div key={recenzija.id} className="recenzija-item">
                            <div className="recenzija-header">
                                <img
                                    src={recenzija.profilna || 'default-avatar.png'}
                                    alt={`${recenzija.ime} ${recenzija.prezime}`}
                                    className="recenzija-avatar"
                                    onError={(e) => (e.target.src = 'default-avatar.png')}
                                />
                                <div className="recenzija-meta">
                                     <span className="recenzija-korisnik">{recenzija.ime} {recenzija.prezime}</span>
                                     <span className="recenzija-datum">{new Date(recenzija.datum_kreiranja).toLocaleDateString('sr-RS')}</span>
                                </div>
                                <RatingStars rating={recenzija.ocena} />
                            </div>
                            {recenzija.tekst && (
                                <p className="recenzija-tekst">{recenzija.tekst}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* --- Kraj Sekcije za Recenzije --- */}

            <button className="proizvod-back-button" onClick={() => navigate(-1)}>
                <FontAwesomeIcon icon={faArrowLeft} /> Nazad na proizvode
            </button>
        </div>
    );
};

export default ProizvodDetalji;