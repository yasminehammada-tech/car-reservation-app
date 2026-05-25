const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/voitures', require('./routes/voitures'));
app.use('/api/reservations', require('./routes/reservations'));

// Test
app.get('/', (req, res) => {
    res.json({ message: '✅ Serveur car-reservation opérationnel !' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});