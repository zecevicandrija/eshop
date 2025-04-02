const express = require('express');
const router = express.Router();
const pool = require('../db'); // pool već vraća promise-based instancu

// Dobavi sve popuste
router.get('/', async (req, res) => {
  try {
    const [popusti] = await pool.query(`
      SELECT id, ime_popusta, procenat 
      FROM popusti
    `);
    res.status(200).json(popusti);
  } catch (error) {
    console.error('Greška u bazi:', error);
    res.status(500).json({ error: 'Greška pri dobavljanju popusta' });
  }
});

// Dodaj novi popust
router.post('/', async (req, res) => {
  const { ime_popusta, procenat } = req.body;

  if (!ime_popusta || procenat === undefined) {
    return res
      .status(400)
      .json({ error: 'Obavezna polja su ime popusta i procenat' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO popusti (ime_popusta, procenat) VALUES (?, ?)',
      [ime_popusta, parseFloat(procenat)]
    );

    res.status(201).json({
      message: 'Popust uspešno dodat',
      discountId: result.insertId,
      ime_popusta,
      procenat: parseFloat(procenat)
    });
  } catch (error) {
    console.error('Greška:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ error: 'Popust sa ovim imenom već postoji' });
    }
    res.status(500).json({ error: 'Greška pri dodavanju popusta' });
  }
});

// Ažuriraj postojeći popust
router.put('/:id', async (req, res) => {
  const discountId = req.params.id;
  const { ime_popusta, procenat } = req.body;

  if (!ime_popusta || procenat === undefined) {
    return res
      .status(400)
      .json({ error: 'Obavezna polja su ime popusta i procenat' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE popusti SET ime_popusta = ?, procenat = ? WHERE id = ?',
      [ime_popusta, parseFloat(procenat), discountId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Popust nije pronađen' });
    }

    res.status(200).json({
      message: 'Popust uspešno ažuriran',
      changes: result.changedRows
    });
  } catch (error) {
    console.error('Greška:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ error: 'Popust sa ovim imenom već postoji' });
    }
    res.status(500).json({ error: 'Greška pri ažuriranju popusta' });
  }
});

// Obriši popust
router.delete('/:id', async (req, res) => {
  const discountId = req.params.id;

  try {
    const [result] = await pool.query('DELETE FROM popusti WHERE id = ?', [
      discountId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Popust nije pronađen' });
    }

    res.status(200).json({
      message: 'Popust uspešno obrisan',
      deletedId: discountId
    });
  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ error: 'Greška pri brisanju popusta' });
  }
});

module.exports = router;
