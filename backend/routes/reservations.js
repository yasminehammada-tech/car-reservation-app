const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/reservations — Liste toutes les réservations
router.get('/', (req, res) => {
    const sql = `SELECT r.*, u.nom as client_nom, u.email as client_email, 
                v.marque, v.modele, v.prix_jour 
                FROM reservations r 
                JOIN users u ON r.user_id = u.id 
                JOIN voitures v ON r.voiture_id = v.id`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.json(results);
    });
});

// GET /api/reservations/user/:id — Réservations d'un utilisateur
router.get('/user/:id', (req, res) => {
    const sql = `SELECT r.*, v.marque, v.modele, v.prix_jour, v.image_url 
                FROM reservations r 
                JOIN voitures v ON r.voiture_id = v.id 
                WHERE r.user_id = ?`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.json(results);
    });
});

// POST /api/reservations — Créer une réservation
router.post('/', (req, res) => {
    const { user_id, voiture_id, date_debut, date_fin } = req.body;

    if (!user_id || !voiture_id || !date_debut || !date_fin)
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });

    // Vérifier disponibilité
    const checkSql = `SELECT * FROM reservations 
                      WHERE voiture_id = ? AND statut = 'active'
                      AND ((date_debut <= ? AND date_fin >= ?) 
                      OR (date_debut <= ? AND date_fin >= ?))`;
    db.query(checkSql, [voiture_id, date_fin, date_debut, date_debut, date_fin], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (results.length > 0)
            return res.status(400).json({ message: '❌ Voiture non disponible pour cette période' });

        // Calculer le prix total
        const prixSql = 'SELECT prix_jour FROM voitures WHERE id = ?';
        db.query(prixSql, [voiture_id], (err, voiture) => {
            if (err) return res.status(500).json({ message: 'Erreur serveur' });

            const debut = new Date(date_debut);
            const fin = new Date(date_fin);
            const jours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
            const prix_total = jours * voiture[0].prix_jour;

            const sql = 'INSERT INTO reservations (user_id, voiture_id, date_debut, date_fin, prix_total) VALUES (?, ?, ?, ?, ?)';
            db.query(sql, [user_id, voiture_id, date_debut, date_fin, prix_total], (err, result) => {
                if (err) return res.status(500).json({ message: 'Erreur serveur' });

                // Mettre la voiture indisponible
                db.query('UPDATE voitures SET disponible = FALSE WHERE id = ?', [voiture_id]);

                res.status(201).json({ 
                    message: '✅ Réservation créée !', 
                    id: result.insertId,
                    prix_total 
                });
            });
        });
    });
});

// PUT /api/reservations/:id — Modifier une réservation
router.put('/:id', (req, res) => {
    const { date_debut, date_fin } = req.body;

    const sql = 'UPDATE reservations SET date_debut=?, date_fin=? WHERE id=?';
    db.query(sql, [date_debut, date_fin, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        res.json({ message: '✅ Réservation modifiée !' });
    });
});

// DELETE /api/reservations/:id — Annuler une réservation
router.delete('/:id', (req, res) => {
    // Récupérer la voiture_id avant d'annuler
    const getSql = 'SELECT voiture_id FROM reservations WHERE id = ?';
    db.query(getSql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (results.length === 0)
            return res.status(404).json({ message: 'Réservation non trouvée' });

        const voiture_id = results[0].voiture_id;

        // Annuler la réservation
        const sql = 'UPDATE reservations SET statut = "annulée" WHERE id = ?';
        db.query(sql, [req.params.id], (err) => {
            if (err) return res.status(500).json({ message: 'Erreur serveur' });

            // Remettre la voiture disponible
            db.query('UPDATE voitures SET disponible = TRUE WHERE id = ?', [voiture_id]);

            res.json({ message: '✅ Réservation annulée !' });
        });
    });
});

module.exports = router;