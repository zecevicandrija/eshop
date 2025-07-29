// routes/affiliate.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const fetch = require('node-fetch'); // Morate instalirati: npm install node-fetch

// Middleware za proveru da li je korisnik ulogovan (ako već nemate)
// Uzećemo ID korisnika iz tokena ili sesije. Za primer, pretpostavićemo da je `req.user.id` dostupan.
// const checkAuth = require('../middleware/checkAuth'); -> primer

const LEMONSQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';
const API_KEY = process.env.LEMONSQUEEZY_API_KEY;

const lsFetch = (endpoint, options = {}) => {
  const url = `${LEMONSQUEEZY_API_URL}${endpoint}`;
  const headers = {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    'Authorization': `Bearer ${API_KEY}`,
  };
  return fetch(url, { ...options, headers });
};

/**
 * @route   POST /api/affiliate/onboard
 * @desc    Registruje ulogovanog korisnika kao novog affiliate partnera
 * @access  Private
 */
router.post('/onboard', async (req, res) => {
  // Pretpostavka je da imate ID ulogovanog korisnika, npr. iz JWT tokena
  const korisnikId = req.body.korisnikId; // U produkciji ovo uzeti iz req.user.id
  if (!korisnikId) {
    return res.status(401).json({ error: 'Niste autorizovani.' });
  }

  try {
    // 1. Proveri da korisnik već nije affiliate
    const [existingAffiliate] = await pool.query('SELECT id FROM affiliates WHERE korisnik_id = ?', [korisnikId]);
    if (existingAffiliate.length > 0) {
      return res.status(409).json({ error: 'Već ste affiliate partner.' });
    }

    // 2. Uzmi podatke o korisniku iz naše baze
    const [korisnici] = await pool.query('SELECT ime, email FROM korisnici WHERE id = ?', [korisnikId]);
    if (korisnici.length === 0) {
      return res.status(404).json({ error: 'Korisnik nije pronađen.' });
    }
    const korisnik = korisnici[0];

    // 3. Kreiraj affiliate-a preko Lemon Squeezy API-ja
    // PAŽNJA: Lemon Squeezy trenutno nema javni API endpoint za kreiranje affiliate-a.
    // Ovo se radi ručnim pozivanjem (invitation) iz Lemon Squeezy dashboard-a.
    // Ovaj API endpoint služiće da SINKRONIZUJEMO podatke nakon što ga vi ručno dodate.
    // Plan je sledeći: vi ga pozovete, on prihvati, a mi onda API-jem povučemo njegove podatke.

    // Privremeno, vratićemo poruku korisniku da je zahtev poslat.
    // U realnosti, vi biste u admin panelu videli ovaj zahtev i poslali pozivnicu iz LS.
    
    // Za sada, simuliramo uspeh i čekamo da ga dodate u LS
    res.status(202).json({ message: 'Vaš zahtev za affiliate program je poslat na odobrenje.' });

  } catch (error) {
    console.error('Greška pri onboardingu affiliate-a:', error);
    res.status(500).json({ error: 'Serverska greška.' });
  }
});


/**
 * @route   GET /api/affiliate/dashboard
 * @desc    Dobavlja podatke za affiliate dashboard ulogovanog korisnika
 * @access  Private
 */
router.get('/dashboard', async (req, res) => {
    // const korisnikId = req.user.id; // Ulogovan korisnik
    const korisnikId = req.query.korisnikId; // Za testiranje
     if (!korisnikId) {
        return res.status(401).json({ error: 'Niste autorizovani.' });
    }

    try {
        const [affiliates] = await pool.query('SELECT id, referral_url, lemonsqueezy_id FROM affiliates WHERE korisnik_id = ?', [korisnikId]);
        if (affiliates.length === 0) {
            // Korisnik nije affiliate, vrati status koji frontend može da iskoristi da prikaže "Počni affiliate"
            return res.status(200).json({ isAffiliate: false });
        }
        const affiliate = affiliates[0];

        // Uzmi statistiku iz naših lokalnih tabela
        const [clicksResult] = await pool.query('SELECT COUNT(id) as totalClicks FROM affiliate_clicks WHERE affiliate_id = ?', [affiliate.id]);
        const [commissionsResult] = await pool.query('SELECT COUNT(id) as totalSales, SUM(commission_amount_usd) as totalEarnings FROM affiliate_commissions WHERE affiliate_id = ?', [affiliate.id]);

        const dashboardData = {
            isAffiliate: true,
            referralUrl: affiliate.referral_url,
            clicks: clicksResult[0].totalClicks || 0,
            sales: commissionsResult[0].totalSales || 0,
            earnings: commissionsResult[0].totalEarnings || 0.00,
        };

        res.json(dashboardData);

    } catch (error) {
        console.error('Greška pri dobavljanju dashboard podataka:', error);
        res.status(500).json({ error: 'Serverska greška.' });
    }
});


/**
 * @route   POST /api/affiliate/webhook
 * @desc    Prima web-hookove od Lemon Squeezy-ja za sinhronizaciju
 * @access  Public (zaštićen potpisom)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // TODO: Implementirati verifikaciju Lemon Squeezy potpisa (veoma važno za sigurnost!)
    // const signature = req.get('X-Signature');
    // Proveriti potpis pre daljeg izvršavanja

    const event = req.body;
    const eventName = event.meta.event_name;
    const data = event.data;

    console.log(`Primljen Lemon Squeezy webhook: ${eventName}`);

    try {
        // Primer za kreiranu porudžbinu koja je došla preko affiliate-a
        if (eventName === 'order_created' && data.attributes.first_order_item.variant_name.includes('Affiliate')) {
            const affiliateIdLs = data.relationships.affiliate.data.id; // ID affiliate-a sa LS
            const orderIdLs = data.id;
            const orderTotal = data.attributes.total_usd;

            // Pronađi našeg affiliate-a u lokalnoj bazi
            const [affiliates] = await pool.query('SELECT id FROM affiliates WHERE lemonsqueezy_id = ?', [affiliateIdLs]);
            if (affiliates.length > 0) {
                const affiliateIdLocal = affiliates[0].id;

                // TODO: Izračunaj proviziju. Ovo je primer, možda dobijete tačan iznos od LS
                const commissionRate = 0.10; // 10% primer
                const commissionAmount = orderTotal * commissionRate;

                // Sačuvaj u našu bazu
                await pool.query(
                    'INSERT INTO affiliate_commissions (affiliate_id, lemonsqueezy_order_id, commission_amount_usd, commission_rate, status) VALUES (?, ?, ?, ?, ?)',
                    [affiliateIdLocal, orderIdLs, commissionAmount, commissionRate, 'pending']
                );
                 console.log(`Sačuvana provizija za porudžbinu ${orderIdLs}`);
            }
        }
        
        // TODO: Dodati logiku za druge eventove, npr. 'payout_paid' da se ažurira status provizije
        
        res.sendStatus(200); // Uvek vrati 200 OK da Lemon Squeezy zna da je webhook primljen
    } catch (error) {
        console.error('Greška pri obradi LS web-hooka:', error);
        res.sendStatus(500);
    }
});


module.exports = router;