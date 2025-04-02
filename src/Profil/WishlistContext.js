import React, { createContext, useState, useEffect, useContext } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Funkcija za dobavljanje liste želja sa backend-a
    const fetchWishlist = async (korisnikId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/wishlist/${korisnikId}`);
            if (!response.ok) {
                throw new Error('Greška pri dobavljanju liste želja');
            }
            const data = await response.json();
            setWishlist(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Funkcija za dodavanje proizvoda u listu želja
    const dodajUListuZelja = async (korisnikId, proizvodId) => {
        try {
            const response = await fetch('http://localhost:5000/api/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ korisnik_id: korisnikId, proizvod_id: proizvodId }),
            });
            if (!response.ok) {
                throw new Error('Greška pri dodavanju u listu želja');
            }
            // Osvježi listu želja nakon dodavanja
            fetchWishlist(korisnikId);
        } catch (err) {
            setError(err.message);
        }
    };

    // Funkcija za brisanje proizvoda iz liste želja
    const ukloniIzListeZelja = async (id, korisnikId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/wishlist/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Greška pri brisanju iz liste želja');
            }
            // Osvježi listu želja nakon brisanja
            fetchWishlist(korisnikId);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, loading, error, fetchWishlist, dodajUListuZelja, ukloniIzListeZelja }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);