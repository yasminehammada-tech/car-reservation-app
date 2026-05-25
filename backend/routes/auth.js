const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

// POST /api/auth/register — Inscription
router.post('/register', (req, res) => {
    const { nom, email, password } = req.body;

    if (!nom || !email || !password)
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = 'INSERT INTO users (nom, email, password) VALUES (?, ?, ?)';
    db.query(sql, [nom, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY')
                return res.status(400).json({ message: 'Email déjà utilisé' });
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.status(201).json({ message: '✅ Compte créé avec succès !' });
    });
});

// POST /api/auth/login — Connexion
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email et mot de passe obligatoires' });

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (results.length === 0)
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

        const user = results[0];
        const isValid = bcrypt.compareSync(password, user.password);

        if (!isValid)
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: '✅ Connexion réussie !',
            token,
            user: { id: user.id, nom: user.nom, email: user.email, role: user.role }
        });
    });
});

module.exports = router;