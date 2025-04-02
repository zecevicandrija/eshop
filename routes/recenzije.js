const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/korisnik/:korisnikId', async (req, res) => {
  const { korisnikId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.ocena, r.tekst, r.datum_kreiranja, p.ime as proizvod_ime, p.slika as proizvod_slika
       FROM recenzije r
       JOIN proizvodi p ON r.proizvod_id = p.id
       WHERE r.korisnik_id = ?
       ORDER BY r.datum_kreiranja DESC`,
      [korisnikId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Greška pri dohvatanju recenzija korisnika:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
});

router.get('/:proizvodId', async (req, res) => {
  const { proizvodId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.ocena, r.tekst, r.datum_kreiranja, k.ime, k.prezime, k.profilna
       FROM recenzije r
       JOIN korisnici k ON r.korisnik_id = k.id
       WHERE r.proizvod_id = ?
       ORDER BY r.datum_kreiranja DESC`,
      [proizvodId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Greška pri dohvatanju recenzija:", error);
    res.status(500).json({ message: "Greška na serveru pri dohvatanju recenzija." });
  }
});

router.post('/', async (req, res) => {
  const { korisnik_id, proizvod_id, ocena, tekst } = req.body;

  if (!korisnik_id || !proizvod_id || !ocena) {
    return res.status(400).json({ message: "Nedostaju obavezni podaci (korisnik_id, proizvod_id, ocena)." });
  }
  if (ocena < 1 || ocena > 5) {
    return res.status(400).json({ message: "Ocena mora biti između 1 i 5." });
  }

  try {
    const [transakcije] = await pool.query(
      `SELECT COUNT(*) as count
       FROM transakcije t
       JOIN korisnici k ON t.email = k.email
       WHERE k.id = ?
         AND t.status IN ('zavrseno', 'Na čekanju')
         AND JSON_CONTAINS(JSON_EXTRACT(t.proizvodi, '$[*].id'), CAST(? AS JSON))`,
      [korisnik_id, proizvod_id]
    );

    if (transakcije[0].count === 0) {
      return res.status(403).json({ message: "Morate kupiti proizvod da biste ostavili recenziju." });
    }

    const [result] = await pool.query(
      'INSERT INTO recenzije (korisnik_id, proizvod_id, ocena, tekst) VALUES (?, ?, ?, ?)',
      [korisnik_id, proizvod_id, ocena, tekst || null]
    );

    const [novaRecenzija] = await pool.query(
      `SELECT r.id, r.ocena, r.tekst, r.datum_kreiranja, k.ime, k.prezime, k.profilna
       FROM recenzije r
       JOIN korisnici k ON r.korisnik_id = k.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json(novaRecenzija[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Već ste ocenili ovaj proizvod." });
    }
    console.error("Greška pri dodavanju recenzije:", error);
    res.status(500).json({ message: "Greška na serveru pri dodavanju recenzije." });
  }
});

router.get('/provera-kupovine/:korisnikId/:proizvodId', async (req, res) => {
  const { korisnikId, proizvodId } = req.params;
  try {
    const [transakcije] = await pool.query(
      `SELECT COUNT(*) as count
       FROM transakcije t
       JOIN korisnici k ON t.email = k.email
       WHERE k.id = ?
         AND t.status IN ('zavrseno', 'Na čekanju')
         AND JSON_CONTAINS(JSON_EXTRACT(t.proizvodi, '$[*].id'), CAST(? AS JSON))`,
      [korisnikId, proizvodId]
    );
    res.json({ kupio: transakcije[0].count > 0 });
  } catch (error) {
    console.error("Greška pri proveri kupovine:", error);
    res.status(500).json({ message: "Greška na serveru pri proveri kupovine." });
  }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params; // ID recenzije koju želimo da ažuriramo
    const { ocena, tekst } = req.body; // Podaci koji se šalju sa klijenta
  
    // Validacija unosa
    if (!ocena) {
      return res.status(400).json({ message: "Ocena je obavezna." });
    }
    if (ocena < 1 || ocena > 5) {
      return res.status(400).json({ message: "Ocena mora biti između 1 i 5." });
    }
  
    try {
      // Ažuriranje recenzije u bazi podataka
      const [result] = await pool.query(
        'UPDATE recenzije SET ocena = ?, tekst = ? WHERE id = ?',
        [ocena, tekst || null, id]
      );
  
      // Provera da li je recenzija pronađena
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Recenzija nije pronađena." });
      }
  
      // Dohvatanje ažurirane recenzije sa podacima o korisniku
      const [updatedRecenzija] = await pool.query(
        `SELECT r.id, r.ocena, r.tekst, r.datum_kreiranja, k.ime, k.prezime, k.profilna
         FROM recenzije r
         JOIN korisnici k ON r.korisnik_id = k.id
         WHERE r.id = ?`,
        [id]
      );
  
      // Slanje ažurirane recenzije kao odgovor
      res.json(updatedRecenzija[0]);
    } catch (error) {
      console.error("Greška pri ažuriranju recenzije:", error);
      res.status(500).json({ message: "Greška na serveru pri ažuriranju recenzije." });
    }
  });

module.exports = router;
