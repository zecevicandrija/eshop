// routes/payment.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');
const axios = require('axios'); // Potreban za slanje API zahteva

// Ruta koju poziva frontend za kreiranje checkout-a
router.post('/create-checkout-session', async (req, res) => {
    const { userInfo, cartItems } = req.body;

    if (!userInfo || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: 'Nedostaju podaci o korisniku ili proizvodima.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Kreiramo transakciju u bazi sa statusom "Na čekanju" (Ovaj deo ostaje isti)
        const transactionQuery = `
          INSERT INTO transakcije (ime, prezime, adresa, email, telefon, datum_transakcije, proizvodi, status, status_placanja)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        // Primetite da sam dodao i `status_placanja` na 'cekanje'
        const [result] = await connection.query(transactionQuery, [
            userInfo.ime, userInfo.prezime, userInfo.adresa, userInfo.email,
            userInfo.telefon, new Date(), JSON.stringify(cartItems), 'Na čekanju', 'cekanje'
        ]);
        const nasaTransakcijaId = result.insertId;

        // 2. Pripremamo proizvode za Fungies.io API poziv
        // **IZMENA**: Mapiramo proizvode iz korpe u format koji Fungies.io zahteva.
        // Koristimo `fungies_product_id` koji ste uneli u bazu.
        const lineItems = cartItems.map(item => ({
            product_id: item.fungies_product_id, // KORISTIMO NOVO POLJE!
            quantity: item.kolicina
        }));

        // 3. Kreiramo checkout sesiju putem Fungies.io API-ja
        const fungiesPayload = {
            line_items: lineItems,
            customer_email: userInfo.email,
            success_url: 'http://localhost:3000/potvrda-kupovine', // URL na koji se korisnik vraća nakon uspešnog plaćanja
            cancel_url: 'http://localhost:3000/korpa',        // URL za povratak ako korisnik odustane
            metadata: {
                nasaTransakcijaId: nasaTransakcijaId // Ključan podatak za povezivanje u webhook-u!
            }
        };
        
        // **NOVO**: API poziv ka Fungies.io
        const fungiesResponse = await axios.post(
            'https://api.fungies.io/v1/checkout_sessions', // Proverite tačan API endpoint u Fungies dokumentaciji
            fungiesPayload,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.FUNGIES_SECRET}` // Koristimo SECRET ključ za autentifikaciju
                }
            }
        );

        const checkoutUrl = fungiesResponse.data.checkout_url; // Pretpostavljamo da se URL nalazi ovde
        
        // **NOVO**: Upisujemo session_id koji smo dobili od Fungies-a u našu bazu
        const sessionId = fungiesResponse.data.id; // Pretpostavljamo da se ID sesije nalazi ovde
        await connection.query('UPDATE transakcije SET session_id = ? WHERE id = ?', [sessionId, nasaTransakcijaId]);


        // 4. Potvrđujemo transakciju u bazi i šaljemo URL frontendu
        await connection.commit();
        res.status(200).json({ checkoutUrl }); // Šaljemo URL frontendu

    } catch (error) {
        await connection.rollback();
        // **NOVO**: Bolje ispisivanje greške ako dođe do problema sa Fungies API-jem
        if (error.response) {
            console.error('Greška od Fungies API-ja:', error.response.data);
            return res.status(500).json({ error: 'Greška pri komunikaciji sa Fungies servisom.', details: error.response.data });
        }
        console.error('Greška pri kreiranju Fungies sesije:', error);
        res.status(500).json({ error: 'Greška na serveru.' });
    } finally {
        connection.release();
    }
});

// Ruta koja prihvata webhook-ove od Fungies-a (za sada ostaje neizmenjena, radićemo je u sledećem koraku)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // TRENUTNO JE STARA LOGIKA, NE DIRATI DOK NE ZAVRŠIMO CHECKOUT
    console.log("Webhook primljen, logika još nije implementirana za Fungies.");
    res.sendStatus(200); // Privremeno samo odgovaramo sa OK
});

module.exports = router;