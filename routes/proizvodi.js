const express = require('express');
const router = express.Router();
const pool = require('../db');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Konfiguracija Cloudinary (preporuka: koristiti .env varijable)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });

// ## Dobavi sve proizvode
router.get('/', async (req, res) => {
    try {
        const [proizvodi] = await pool.query(`
            SELECT id, ime, opis, cena, slika, kolicina 
            FROM proizvodi
        `);
        res.status(200).json(proizvodi);
    } catch (error) {
        console.error('Greška u bazi:', error);
        res.status(500).json({ error: 'Greška pri dobavljanju proizvoda' });
    }
});

// ## Dobavi jedan proizvod po ID-u
router.get('/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const [proizvod] = await pool.query(
            `SELECT id, ime, opis, cena, slika, kolicina 
             FROM proizvodi 
             WHERE id = ?`,
            [productId]
        );
        if (proizvod.length === 0) {
            return res.status(44).json({ error: 'Proizvod nije pronađen' });
        }
        res.status(200).json(proizvod[0]);
    } catch (error) {
        console.error('Greška:', error);
        res.status(500).json({ error: 'Greška pri dobavljanju proizvoda' });
    }
});

// ## Dodaj novi proizvod
router.post('/', upload.single('slika'), async (req, res) => {
    const { ime, opis, cena, kolicina } = req.body;
    if (!ime || !cena || !req.file) {
        return res.status(400).json({ error: 'Ime, cena i slika su obavezna polja' });
    }

    try {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'proizvodi' },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary greška:', error);
                    return res.status(500).json({ error: 'Greška pri uploadu slike' });
                }

                const slikaUrl = result.secure_url;

                const [insertResult] = await pool.query(
                    `INSERT INTO proizvodi (ime, opis, cena, slika, kolicina) VALUES (?, ?, ?, ?, ?)`,
                    [
                        ime,
                        opis || null,
                        parseFloat(cena),
                        slikaUrl,
                        kolicina !== undefined ? parseInt(kolicina) : 0
                    ]
                );

                res.status(201).json({
                    message: 'Proizvod uspešno dodat',
                    productId: insertResult.insertId,
                    slikaUrl
                });
            }
        );

        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
    } catch (error) {
        console.error('Greška:', error);
        res.status(500).json({ error: 'Greška pri dodavanju proizvoda' });
    }
});

// ## Ažuriraj proizvod
router.put('/:id', upload.single('slika'), async (req, res) => {
    const productId = req.params.id;
    const { ime, opis, cena, kolicina } = req.body;
    let slikaUrl;

    const processUpdate = async () => {
        const updates = [];
        const params = [];

        if (ime) {
            updates.push('ime = ?');
            params.push(ime);
        }
        if (opis !== undefined) {
            updates.push('opis = ?');
            params.push(opis);
        }
        if (cena) {
            updates.push('cena = ?');
            params.push(parseFloat(cena));
        }
        if (kolicina !== undefined) {
            updates.push('kolicina = ?');
            params.push(parseInt(kolicina));
        }
        if (slikaUrl) {
            updates.push('slika = ?');
            params.push(slikaUrl);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nema podataka za ažuriranje' });
        }

        params.push(productId);
        const query = `UPDATE proizvodi SET ${updates.join(', ')} WHERE id = ?`;

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Proizvod nije pronađen' });
        }

        res.status(200).json({
            message: 'Proizvod uspešno ažuriran'
        });
    };

    try {
        if (req.file) {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'proizvodi' },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary greška:', error);
                        return res.status(500).json({ error: 'Greška pri uploadu nove slike' });
                    }
                    slikaUrl = result.secure_url;
                    processUpdate().catch(err => {
                        console.error('Greška pri ažuriranju proizvoda nakon uploada:', err);
                        res.status(500).json({ error: 'Greška pri ažuriranju proizvoda' });
                    });
                }
            );

            const bufferStream = new Readable();
            bufferStream.push(req.file.buffer);
            bufferStream.push(null);
            bufferStream.pipe(uploadStream);
        } else {
            await processUpdate();
        }
    } catch (error) {
        console.error('Greška:', error);
        res.status(500).json({ error: 'Greška pri ažuriranju proizvoda' });
    }
});

// ## Obriši proizvod
router.delete('/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const [result] = await pool.query(
            'DELETE FROM proizvodi WHERE id = ?',
            [productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Proizvod nije pronađen' });
        }

        res.status(200).json({
            message: 'Proizvod uspešno obrisan',
        });
    } catch (error) {
        console.error('Greška:', error);
        res.status(500).json({ error: 'Greška pri brisanju proizvoda' });
    }
});

module.exports = router;