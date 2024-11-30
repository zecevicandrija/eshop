// routes/popusti.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint za dobavljanje svih popusta
router.get('/', (req, res) => {
    const query = 'SELECT * FROM popusti';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint za dodavanje novog popusta
router.post('/', (req, res) => {
    const { ime_popusta, procenat } = req.body;

    if (!ime_popusta || procenat === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO popusti (ime_popusta, procenat) VALUES (?, ?)';
    db.query(query, [ime_popusta, procenat], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Discount added successfully', discountId: results.insertId });
    });
});

// Endpoint za ažuriranje popusta
router.put('/:id', (req, res) => {
    const discountId = req.params.id;
    const { ime_popusta, procenat } = req.body;

    if (!ime_popusta || procenat === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'UPDATE popusti SET ime_popusta = ?, procenat = ? WHERE id = ?';
    db.query(query, [ime_popusta, procenat, discountId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'Discount updated successfully' });
    });
});

// Endpoint za brisanje popusta
router.delete('/:id', (req, res) => {
    const discountId = req.params.id;
    const query = 'DELETE FROM popusti WHERE id = ?';
    db.query(query, [discountId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `Discount with ID ${discountId} deleted successfully` });
    });
});

module.exports = router;