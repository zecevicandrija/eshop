const express = require('express');
const router = express.Router();
const pool = require('../db');

// Dobavi sve transakcije
router.get('/', async (req, res) => {
  try {
    const [transakcije] = await pool.query(`
      SELECT id, ime, prezime, adresa, email, telefon, 
             datum_transakcije, proizvodi 
      FROM transakcije
    `);

    // Uklonite JSON.parse jer je proizvodi već parsiran objekat
    const parsedTransactions = transakcije.map(t => ({
      ...t,
      proizvodi: t.proizvodi || [] // Ako je null, postavi na prazan niz
    }));

    res.status(200).json(parsedTransactions);
  } catch (error) {
    console.error('Greška u bazi:', error);
    res.status(500).json({ error: 'Greška pri dobavljanju transakcija' });
  }
});

// Dodaj novu transakciju
router.post('/', async (req, res) => {
  const { ime, prezime, adresa, email, telefon, datum_transakcije, proizvodi } = req.body;

  try {
    // Validacija obaveznih polja
    if (!ime || !prezime || !email || !datum_transakcije || !proizvodi) {
      return res.status(400).json({ error: 'Nedostaju obavezna polja' });
    }
    if (!Array.isArray(proizvodi)) {
      return res.status(400).json({ error: 'Proizvodi moraju biti niz' });
    }

    const query = `
      INSERT INTO transakcije 
      (ime, prezime, adresa, email, telefon, datum_transakcije, proizvodi)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      ime,
      prezime,
      adresa || null,
      email,
      telefon || null,
      new Date(datum_transakcije),
      JSON.stringify(proizvodi)
    ]);

    res.status(201).json({ 
      message: 'Transakcija uspešno dodata',
      transactionId: result.insertId
    });
  } catch (error) {
    console.error('Greška:', error);
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      return res.status(400).json({ error: 'Nevalidan format datuma' });
    }
    res.status(500).json({ error: 'Greška pri dodavanju transakcije' });
  }
});

// Ažuriraj transakciju
router.put('/:id', async (req, res) => {
  const transactionId = req.params.id;
  const { ime, prezime, adresa, email, telefon, datum_transakcije, proizvodi } = req.body;

  try {
    // Validacija obaveznih polja
    if (!ime || !prezime || !email || !datum_transakcije || !proizvodi) {
      return res.status(400).json({ error: 'Nedostaju obavezna polja' });
    }

    const query = `
      UPDATE transakcije 
      SET ime = ?, prezime = ?, adresa = ?, email = ?, telefon = ?, 
          datum_transakcije = ?, proizvodi = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(query, [
      ime,
      prezime,
      adresa || null,
      email,
      telefon || null,
      new Date(datum_transakcije),
      JSON.stringify(proizvodi),
      transactionId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transakcija nije pronađena' });
    }

    res.status(200).json({ 
      message: 'Transakcija uspešno ažurirana',
      changes: result.changedRows
    });
  } catch (error) {
    console.error('Greška:', error);
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      return res.status(400).json({ error: 'Nevalidan format datuma' });
    }
    res.status(500).json({ error: 'Greška pri ažuriranju transakcije' });
  }
});

// Obriši transakciju
router.delete('/:id', async (req, res) => {
  const transactionId = req.params.id;

  try {
    const [result] = await pool.query(
      'DELETE FROM transakcije WHERE id = ?',
      [transactionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transakcija nije pronađena' });
    }

    res.status(200).json({ 
      message: 'Transakcija uspešno obrisana',
      deletedId: transactionId
    });
  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ error: 'Greška pri brisanju transakcije' });
  }
});

// Dobavi transakcije po emailu
router.get('/by-email/:email', async (req, res) => {
  const email = req.params.email;
  
  try {
    const [transakcije] = await pool.query(
      `SELECT id, datum_transakcije, proizvodi, status 
       FROM transakcije 
       WHERE email = ? 
       ORDER BY datum_transakcije DESC`,
      [email]
    );

    const parsedTransactions = transakcije.map(t => ({
      ...t,
      // Proveri tip podataka pre parsiranja
      proizvodi: typeof t.proizvodi === 'string' ? JSON.parse(t.proizvodi) : t.proizvodi
    }));

    res.status(200).json(parsedTransactions);
  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ 
      error: 'Greška pri dobavljanju transakcija',
      details: error.message 
    });
  }
});


module.exports = router;
