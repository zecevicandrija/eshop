const express = require('express');
const router = express.Router();
const pool = require('../db');

// Dobavljanje liste želja za korisnika
router.get('/:korisnik_id', async (req, res) => {
  const korisnikId = req.params.korisnik_id;
  try {
    const [results] = await pool.query(
      `SELECT w.id, w.proizvod_id, p.ime, p.cena, p.slika 
       FROM wishlist w 
       JOIN proizvodi p ON w.proizvod_id = p.id 
       WHERE w.korisnik_id = ?`,
      [korisnikId]
    );
    res.status(200).json(results);
  } catch (error) {
    console.error('Greška pri dobavljanju liste želja:', error);
    res.status(500).json({ error: 'Greška pri dobavljanju liste želja' });
  }
});

// Dodavanje proizvoda u listu želja
router.post('/', async (req, res) => {
  const { korisnik_id, proizvod_id } = req.body;

  try {
    // Provera postojanja korisnika i proizvoda
    const [user] = await pool.query('SELECT id FROM korisnici WHERE id = ?', [korisnik_id]);
    const [product] = await pool.query('SELECT id FROM proizvodi WHERE id = ?', [proizvod_id]);

    if (!user.length || !product.length) {
      return res.status(404).json({ error: 'Korisnik ili proizvod nije pronađen' });
    }

    // Provera da li proizvod već postoji u wishlisti
    const [existing] = await pool.query(
      'SELECT * FROM wishlist WHERE korisnik_id = ? AND proizvod_id = ?',
      [korisnik_id, proizvod_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Proizvod već postoji u listi želja' });
    }

    // Dodavanje proizvoda u wishlist
    await pool.query(
      'INSERT INTO wishlist (korisnik_id, proizvod_id) VALUES (?, ?)',
      [korisnik_id, proizvod_id]
    );

    res.status(201).json({ message: 'Proizvod dodat u listu želja' });
  } catch (error) {
    console.error('Greška pri dodavanju u listu želja:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
});

// Brisanje proizvoda iz liste želja
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM wishlist WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proizvod nije pronađen u listi želja' });
    }
    res.status(200).json({ message: 'Proizvod uklonjen iz liste želja' });
  } catch (error) {
    console.error('Greška pri brisanju iz liste želja:', error);
    res.status(500).json({ error: 'Greška pri brisanju iz liste želja' });
  }
});

module.exports = router;
