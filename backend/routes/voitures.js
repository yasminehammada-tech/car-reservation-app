const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/voitures — Liste toutes les voitures
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM voitures';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.json(results);
    });
});

// GET /api/voitures/:id — Détail d'une voiture
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM voitures WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (results.length === 0)
            return res.status(404).json({ message: 'Voiture non trouvée' });
        res.json(results[0]);
    });
});

// POST /api/voitures — Ajouter une voiture (admin)
router.post('/', (req, res) => {
    const { marque, modele, annee, prix_jour, image_url, description } = req.body;

    if (!marque || !modele || !annee || !prix_jour)
        return res.status(400).json({ message: 'Champs obligatoires manquants' });

    const sql = 'INSERT INTO voitures (marque, modele, annee, prix_jour, image_url, description) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [marque, modele, annee, prix_jour, image_url, description], (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.status(201).json({ message: '✅ Voiture ajoutée !', id: result.insertId });
    });
});

// PUT /api/voitures/:id — Modifier une voiture (admin)
router.put('/:id', (req, res) => {
    const { marque, modele, annee, prix_jour, disponible, image_url, description } = req.body;

    const sql = 'UPDATE voitures SET marque=?, modele=?, annee=?, prix_jour=?, disponible=?, image_url=?, description=? WHERE id=?';
    db.query(sql, [marque, modele, annee, prix_jour, disponible, image_url, description, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.json({ message: '✅ Voiture modifiée !' });
    });
});

// DELETE /api/voitures/:id — Supprimer une voiture (admin)
router.delete('/:id', (req, res) => {
    // Vérifier si la voiture a des réservations actives
    const checkSql = 'SELECT * FROM reservations WHERE voiture_id = ? AND statut = "active"';
    db.query(checkSql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (results.length > 0)
            return res.status(400).json({ message: '❌ Impossible de supprimer une voiture avec des réservations actives' });

        const sql = 'DELETE FROM voitures WHERE id = ?';
        db.query(sql, [req.params.id], (err) => {
            if (err) return res.status(500).json({ message: 'Erreur serveur' });
            res.json({ message: '✅ Voiture supprimée !' });
        });
    });
});

module.exports = router;