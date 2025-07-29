// routes/payment.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');

// Ruta koju poziva frontend za kreiranje checkout-a
router.post('/create-checkout-session', async (req, res) => {
    const { userInfo, cartItems } = req.body;

    if (!userInfo || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: 'Nedostaju podaci o korisniku ili proizvodima.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Kreiramo transakciju u bazi sa statusom "Na čekanju"
        const transactionQuery = `
          INSERT INTO transakcije (ime, prezime, adresa, email, telefon, datum_transakcije, proizvodi, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(transactionQuery, [
            userInfo.ime, userInfo.prezime, userInfo.adresa, userInfo.email,
            userInfo.telefon, new Date(), JSON.stringify(cartItems), 'Na čekanju'
        ]);
        const nasaTransakcijaId = result.insertId;

        // 2. Pripremamo proizvode za Payhip URL
        // Pretpostavka je da 'cartItems' sa frontenda sadrži i 'payhip_link' (koji je zapravo ID)
        const payhipItems = cartItems.map(item => ({
            id: item.payhip_link, // Koristimo vrednost iz vaše nove kolone
            quantity: item.kolicina
        }));

        const encodedItems = encodeURIComponent(JSON.stringify(payhipItems));
        
        // 3. Generišemo checkout URL i prosleđujemo ID naše transakcije
        const checkoutUrl = `https://payhip.com/buy?items=${encodedItems}&passthrough=${nasaTransakcijaId}`;
        
        await connection.commit();
        res.status(200).json({ checkoutUrl });

    } catch (error) {
        await connection.rollback();
        console.error('Greška pri kreiranju Payhip sesije:', error);
        res.status(500).json({ error: 'Greška na serveru.' });
    } finally {
        connection.release();
    }
});

// Ruta koja prihvata webhook-ove od Payhip-a
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // Verifikacija potpisa - ključno za sigurnost!
    const signature = req.get('payhip-signature');
    const secret = process.env.PAYHIP_WEBHOOK_SECRET;
    
    // Kreiramo hash koristeći secret iz .env fajla
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(req.body)
        .digest('hex');

    if (signature !== expectedSignature) {
        console.warn('Neispravan potpis webhook-a.');
        return res.status(400).send('Invalid signature.');
    }

    const payload = JSON.parse(req.body);
    const passthroughData = payload.passthrough;
    const payhipOrderId = payload.order_id;
    
    // Obrađujemo samo događaj uspešne uplate
    if (payload.event === 'payment_completed') {
        const nasaTransakcijaId = passthroughData;
        if (!nasaTransakcijaId) return res.sendStatus(400);

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Ažuriramo status transakcije i upisujemo Payhip ID
            await connection.query(
                'UPDATE transakcije SET status = ?, payhip_order_id = ? WHERE id = ? AND status = ?',
                ['zavrseno', payhipOrderId, nasaTransakcijaId, 'Na čekanju']
            );
            
            // Smanjujemo zalihe proizvoda
            const [rows] = await connection.query('SELECT proizvodi FROM transakcije WHERE id = ?', [nasaTransakcijaId]);
            const itemsToUpdate = rows[0].proizvodi;

            for (const item of itemsToUpdate) {
                await connection.query(
                    'UPDATE proizvodi SET kolicina = kolicina - ? WHERE id = ?',
                    [item.kolicina, item.id]
                );
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            console.error('Greška pri obradi webhook-a:', error);
            return res.sendStatus(500);
        } finally {
            connection.release();
        }
    }
    
    res.sendStatus(200);
});

module.exports = router;