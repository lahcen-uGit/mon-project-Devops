const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser');
const port = 3002;
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
const upload = multer({ dest: 'uploads/' });
// Configuration de la connexion MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ecommerce'
});

// Connexion à la base de données
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');

  // Lire le fichier JSON
  /*const data = fs.readFileSync('shop.json', 'utf8');
  const products = JSON.parse(data);*/

  app.post('/submit', upload.single('imgsrc'), (req, res) => {
    const { name, price } = req.body; // Récupère les données du formulaire
    const imgsrc = req.file.path; // Récupère le chemin du fichier téléchargé
    const sql = 'INSERT INTO products (name, price, imgsrc) VALUES (?, ?, ?)';
    
    connection.query(sql, [name, price, imgsrc], (err, result) => {
        if (err) {
            throw err; // Gère les erreurs
        }
        console.log('Produit ajouté:', result); // Log de confirmation
        res.redirect('/'); // Redirige l'utilisateur après l'ajout
    });
});

  /*
  products.forEach(product => {
    const { name, price, imgsrc } = product;
    const query = 'INSERT INTO products (name, price, imgsrc) VALUES (?, ?, ?)';
    connection.query(query, [name, parseFloat(price.replace('$', '')), imgsrc], (err, result) => {
      if (err) throw err;
      console.log('Product inserted:', result.insertId);
    });
  });
  */

  
});

/*register code  debut */

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Email and password validation
  const emailRegex = /^[^\s@]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Email invalide");
  }

  if (password.length < 8) {
    return res.status(400).send("Le mot de passe doit contenir au moins 8 caractères");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    connection.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) {
        throw err;
      }
      console.log("Données insérées dans la base de données");
      res.redirect("/shop.html");
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'inscription");
  }
});


app.get("/register", (req, res) => {;
    res.sendFile(path.join(__dirname ,'register.html'));
});





/*register code  fin */



/*login code  debut */

/*
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Requête SQL pour récupérer l'utilisateur par email
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("<script>alert('Erreur lors de la connexion'); window.location.href = '/';</script>");
    }

    if (results.length === 0) {
      return res.status(400).send("<script>alert('Email ou mot de passe incorrect'); window.location.href = '/';</script>");
    }

    const user = results[0];

    // Comparer le mot de passe saisi avec le mot de passe haché dans la base de données
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).send("<script>alert('Erreur lors de la connexion'); window.location.href = '/';</script>");
      }

      if (!isMatch) {
        return res.status(400).send("<script>alert('Email ou mot de passe incorrect not match'); window.location.href = '/';</script>");
      }

      // Rediriger l'utilisateur vers la page d'accueil si les informations sont correctes
      res.send("<script>alert('Connexion réussie'); window.location.href = '/home';</script>");
    });
  });
});

*/





/*login code  fin */





// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

app.get('/add-product', (req, res) => { 
  res.sendFile(path.join(__dirname, 'addproduct.html')); });
// Route pour la racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour récupérer les produits
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});