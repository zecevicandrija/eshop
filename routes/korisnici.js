const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');


// Endpoint za dobavljanje svih korisnika
router.get('/', (req, res) => {
    const query = 'SELECT * FROM korisnici';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint za dodavanje novog korisnika
router.post('/', async (req, res) => {
    const { ime, prezime, email, sifra, uloga, adresa, telefon } = req.body;

    try {
        if (!ime || !prezime || !email || !sifra || !uloga || !telefon || !adresa) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const hashedPassword = await bcrypt.hash(sifra, 10);
        console.log('Hashed password:', hashedPassword);

        const query = 'INSERT INTO korisnici (ime, prezime, email, sifra, uloga, adresa, telefon) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [ime, prezime, email, hashedPassword, uloga, telefon, adresa], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User added successfully', userId: results.insertId });
        });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Endpoint za ažuriranje korisnika
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { ime, prezime, email, sifra, uloga, adresa, telefon } = req.body;

    try {
        // Provjera da li je potrebno ažurirati lozinku
        let hashedPassword;
        if (sifra) {
            hashedPassword = await bcrypt.hash(sifra, 10);
        }

        // Priprema SQL upita
        let query = 'UPDATE korisnici SET ime = ?, prezime = ?, email = ?, uloga = ?, adresa = ?, telefon = ?';
        let queryParams = [ime, prezime, email, uloga, adresa, telefon];

        // Ako je lozinka uključena u upit, dodajte je u SQL upit
        if (sifra) {
            query += ', sifra = ?';
            queryParams.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        queryParams.push(userId);

        // Izvršavanje SQL upita
        db.query(query, queryParams, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json({ message: `User with ID ${userId} updated successfully` });
        });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Endpoint za brisanje korisnika
router.delete('/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM korisnici WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `User with ID ${userId} deleted successfully` });
    });
});

module.exports = router;