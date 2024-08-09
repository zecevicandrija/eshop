const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../db'); // Pretpostavimo da imamo db modul za konekciju sa bazom
const sendVerificationEmail = require('./emailservice');

// Validacija email adrese
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generisanje verifikacionog tokena
function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Endpoint za dobavljanje svih korisnika
router.get("/", (req, res) => {
    const query = `SELECT id, ime, prezime FROM korisnici`;
    db.query(query, (error, results) => {
        if (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: "Database error" });
            return;
        }
        res.json(results);
    });
});

// Endpoint za registraciju korisnika
router.post('/korisnici', async (req, res) => {
    const { ime, prezime, email, sifra, uloga } = req.body;
    console.log('Received new user data:', { ime, prezime, email, uloga });

    try {
        if (!ime || !prezime || !email || !sifra || !uloga) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const checkQuery = "SELECT * FROM korisnici WHERE email = ?";
        db.query(checkQuery, [email], async (checkErr, checkResults) => {
            if (checkErr) {
                console.error('Error checking user existence:', checkErr);
                return res.status(500).json({ error: 'Database error' });
            }

            if (checkResults.length > 0) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            try {
                const hashedPassword = await bcrypt.hash(sifra, 10);
                const insertQuery = "INSERT INTO korisnici (ime, prezime, email, sifra, uloga, verification_token, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())";
                const values = [ime, prezime, email, hashedPassword, uloga, verificationToken];

                db.query(insertQuery, values, (insertErr, result) => {
                    if (insertErr) {
                        console.error('Error inserting user into database:', insertErr);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    console.log("Inserted a new user with ID:", result.insertId);


                    return res.status(200).json({ message: 'User created successfully, verification email sent' });
                });
            } catch (hashError) {
                console.error('Error hashing password:', hashError);
                return res.status(500).json({ error: 'Password hashing error' });
            }
        });
    } catch (err) {
        console.error('Error in /korisnici route:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint za verifikaciju korisnika
router.get('/verify/:token', (req, res) => {
    const { token } = req.params;
    const query = "UPDATE korisnici SET verified = 1 WHERE verification_token = ?";
    db.query(query, [token], (error, results) => {
        if (error) {
            console.error("Error verifying user:", error);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.affectedRows === 0) {
            return res.status(400).json({ error: "Invalid or expired verification token" });
        }

        return res.status(200).json({ message: "User verified successfully" });
    });
});

// Endpoint za prijavu korisnika
router.post('/login', (req, res) => {
    const { email, sifra } = req.body;

    const query = 'SELECT * FROM korisnici WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error retrieving user from database:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(sifra, user.sifra, (compareErr, isPasswordValid) => {
                if (compareErr) {
                    console.error('Error comparing passwords:', compareErr);
                    return res.status(500).json({ error: 'Password comparison error' });
                }

                if (isPasswordValid) {
                    res.status(200).json({ message: 'Login successful', user });
                } else {
                    res.status(401).json({ message: 'Invalid password' });
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// Endpoint za dobavljanje podataka korisnika
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    console.log(`Fetching data for user ID: ${userId}`);

    const query = 'SELECT id, ime, prezime, email, uloga FROM korisnici WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            const user = results[0];
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// Endpoint za dobavljanje svih korisnika
router.get('/korisnici', (req, res) => {
    const query = 'SELECT id, ime, prezime, email, uloga FROM korisnici';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving users from database:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;