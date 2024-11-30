const express = require('express');
const router = express.Router();
const db = require('../db'); // Pretpostavljam da već imaš postavljenu konekciju sa bazom podataka u `db.js`
const multer = require('multer');
const path = require('path');

// Konfiguriši multer za čuvanje fajlova
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ storage });

// Endpoint za dobavljanje svih proizvoda
router.get('/', (req, res) => {
    const query = 'SELECT * FROM proizvodi';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint za dodavanje novog proizvoda
router.post('/', upload.single('slika'), (req, res) => {
    const { ime, opis, cena, kolicina } = req.body;
    const slika = req.file ? req.file.filename : null;

    if (!ime || !cena) {
        return res.status(400).json({ error: 'Ime i cena su obavezna polja' });
    }

    const query = 'INSERT INTO proizvodi (ime, opis, cena, slika, kolicina) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [ime, opis, cena, slika, kolicina], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Product added successfully', productId: results.insertId });
    });
});

// Endpoint za ažuriranje proizvoda
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { ime, cena, opis, kolicina } = req.body;

    const query = 'UPDATE proizvodi SET ime = ?, cena = ?, opis = ?, kolicina = ? WHERE id = ?';
    db.query(query, [ime, cena, opis, kolicina, id], (error, results) => {
        if (error) {
            console.error('Greška pri ažuriranju proizvoda:', error);
            return res.status(500).json({ message: 'Greška na serveru' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Proizvod nije pronađen' });
        }
        res.status(200).json({ message: 'Proizvod ažuriran' });
    });
});

// Endpoint za brisanje proizvoda
router.delete('/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM proizvodi WHERE id = ?';
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `Product with ID ${productId} deleted successfully` });
    });
});

module.exports = router;
