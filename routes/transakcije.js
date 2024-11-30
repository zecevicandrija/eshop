const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint za dobavljanje svih transakcija
router.get('/', (req, res) => {
    const query = `
        SELECT * FROM transakcije
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint za dodavanje nove transakcije
router.post('/', (req, res) => {
    const { ime, prezime, adresa, email, telefon, datum_transakcije, proizvodi } = req.body;

    if (!ime || !prezime || !email || !datum_transakcije || !proizvodi) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO transakcije (ime, prezime, adresa, email, telefon, datum_transakcije, proizvodi)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const proizvodiJson = JSON.stringify(proizvodi);
    console.log('Podaci za umetanje:', { ime, prezime, adresa, email, telefon, datum_transakcije, proizvodiJson });

    db.query(query, [ime, prezime, adresa, email, telefon, datum_transakcije, proizvodiJson], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Transaction added successfully', transactionId: results.insertId });
    });
});


// Endpoint za aÅ¾uriranje transakcije
router.put('/:id', (req, res) => {
    const transactionId = req.params.id;
    const { ime, prezime, adresa, email, telefon, datum_transakcije, ukupna_cena, proizvodi } = req.body;

    if (!ime || !prezime || !email || !datum_transakcije || !ukupna_cena || !proizvodi) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        UPDATE transakcije 
        SET ime = ?, prezime = ?, adresa = ?, email = ?, telefon = ?, datum_transakcije = ?, ukupna_cena = ?, proizvodi = ?
        WHERE id = ?
    `;
    db.query(query, [ime, prezime, adresa, email, telefon, datum_transakcije, ukupna_cena, JSON.stringify(proizvodi), transactionId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `Transaction with ID ${transactionId} updated successfully` });
    });
});

// Endpoint za brisanje transakcije
router.delete('/:id', (req, res) => {
    const transactionId = req.params.id;
    const query = 'DELETE FROM transakcije WHERE id = ?';
    db.query(query, [transactionId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `Transaction with ID ${transactionId} deleted successfully` });
    });
});

// Eksportuj ruter
module.exports = router;