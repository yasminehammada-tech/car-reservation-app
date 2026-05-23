-- Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('client', 'admin') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des voitures
CREATE TABLE voitures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100) NOT NULL,
    annee INT NOT NULL,
    prix_jour DECIMAL(10,2) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des réservations
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    voiture_id INT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    prix_total DECIMAL(10,2),
    statut ENUM('active', 'annulée', 'terminée') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (voiture_id) REFERENCES voitures(id)
);

-- Ajouter un admin par défaut
INSERT INTO users (nom, email, password, role) 
VALUES ('Admin', 'admin@car-reservation.com', 'admin123', 'admin');

-- Ajouter quelques voitures de test
INSERT INTO voitures (marque, modele, annee, prix_jour, disponible) VALUES
('Dacia', 'Sandero', 2022, 200.00, TRUE),
('Renault', 'Clio', 2023, 250.00, TRUE),
('Peugeot', '208', 2022, 300.00, TRUE),
('Hyundai', 'i10', 2021, 180.00, TRUE);