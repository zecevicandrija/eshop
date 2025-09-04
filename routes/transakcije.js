const express = require('express');
const router = express.Router();
const pool = require('../db');

// ## Dobavi sve transakcije (za admin panel)
router.get('/', async (req, res) => {
    try {
        const [transakcije] = await pool.query(`
            SELECT id, ime, prezime, adresa, email, telefon, datum_transakcije, proizvodi, status 
            FROM transakcije 
            ORDER BY datum_transakcije DESC
        `);

        const parsedTransactions = transakcije.map(t => ({
            ...t,
            proizvodi: t.proizvodi || []
        }));

        res.status(200).json(parsedTransactions);
    } catch (error) {
        console.error('Greška u bazi:', error);
        res.status(500).json({ error: 'Greška pri dobavljanju transakcija' });
    }
});

// ## Dobavi transakcije po emailu (za korisnički profil)
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
            proizvodi: typeof t.proizvodi === 'string' ? JSON.parse(t.proizvodi) : (t.proizvodi || [])
        }));

        res.status(200).json(parsedTransactions);
    } catch (error) {
        console.error('Greška:', error);
        res.status(500).json({ error: 'Greška pri dobavljanju transakcija' });
    }
});

// ## Kreiraj novu transakciju (ključna ruta koju poziva frontend)
router.post('/', async (req, res) => {
    const { ime, prezime, adresa, email, telefon, proizvodi } = req.body;

    if (!ime || !prezime || !email || !proizvodi || !Array.isArray(proizvodi) || proizvodi.length === 0) {
        return res.status(400).json({ error: 'Nedostaju obavezna polja ili su neispravna.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Provera zaliha za svaki proizvod
        for (const item of proizvodi) {
            const [[product]] = await connection.query('SELECT ime, kolicina FROM proizvodi WHERE id = ? FOR UPDATE', [item.id]);
            if (!product || product.kolicina < item.kolicina) {
                // Prekidamo transakciju ako nema dovoljno proizvoda
                await connection.rollback();
                return res.status(400).json({ error: `Nema dovoljno zaliha za proizvod: ${product.ime}` });
            }
        }

        // 2. Kreiranje transakcije sa statusom "Završeno"
        const transakcijaQuery = `
            INSERT INTO transakcije (ime, prezime, adresa, email, telefon, datum_transakcije, proizvodi, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(transakcijaQuery, [
            ime, prezime, adresa || null, email, telefon || null, new Date(), JSON.stringify(proizvodi), 'Završeno'
        ]);
        const transactionId = result.insertId;

        // 3. Smanjivanje količine proizvoda na zalihama
        for (const item of proizvodi) {
            await connection.query('UPDATE proizvodi SET kolicina = kolicina - ? WHERE id = ?', [item.kolicina, item.id]);
        }

        // Ako je sve prošlo uspešno, potvrđujemo izmene
        await connection.commit();

        res.status(201).json({
            message: 'Narudžbina je uspešno kreirana!',
            transactionId: transactionId
        });

    } catch (error) {
        // Ako se desi bilo kakva greška, poništavamo sve
        if (connection) await connection.rollback();
        console.error('Greška pri kreiranju transakcije:', error);
        res.status(500).json({ error: 'Došlo je do greške na serveru.' });
    } finally {
        // Uvek oslobađamo konekciju
        if (connection) connection.release();
    }
});

// ## Ažuriraj transakciju (za admin panel)
router.put('/:id', async (req, res) => {
    const transactionId = req.params.id;
    const { ime, prezime, adresa, email, telefon, status } = req.body;

    try {
        const updates = [];
        const params = [];

        if (ime) { updates.push('ime = ?'); params.push(ime); }
        if (prezime) { updates.push('prezime = ?'); params.push(prezime); }
        if (adresa) { updates.push('adresa = ?'); params.push(adresa); }
        if (email) { updates.push('email = ?'); params.push(email); }
        if (telefon) { updates.push('telefon = ?'); params.push(telefon); }
        if (status) { updates.push('status = ?'); params.push(status); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nema podataka za ažuriranje' });
        }

        params.push(transactionId);
        const query = `UPDATE transakcije SET ${updates.join(', ')} WHERE id = ?`;

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transakcija nije pronađena' });
        }

        res.status(200).json({ message: 'Transakcija uspešno ažurirana' });
    } catch (error) {
        console.error('Greška:', error);
        res.status(500).json({ error: 'Greška pri ažuriranju transakcije' });
    }
});

// ## Obriši transakciju (za admin panel)
router.delete('/:id', async (req, res) => {
    const transactionId = req.params.id;
    try {
        const [result] = await pool.query('DELETE FROM transakcije WHERE id = ?', [transactionId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transakcija nije pronađena' });
        }

        res.status(200).json({ message: 'Transakcija uspešno obrisana' });
    } catch (error) {
        console.error('Greška:', error);
        res.status(500).json({ error: 'Greška pri brisanju transakcije' });
    }
});

module.exports = router;