const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const db = new sqlite3.Database('health.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age INTEGER,
      temperature REAL,
      heart_rate INTEGER,
      healthStatus TEXT
    )
  `);
});

app.use(bodyParser.json());

db.serialize(() => {
  db.all('SELECT 1', (err) => {
    if (err) {
      console.error('Database connection failed:', err);
    } else {
      console.log('Database connection established');
    }
  });
});


app.post('/patients', (req, res) => {
  const { name, age, temperature, heart_rate } = req.body;

 
  let healthStatus = 'Normal';

  
  if (temperature < 35) {
    healthStatus = 'Low Temperature';
  } else if (temperature > 42) {
    healthStatus = 'High Temperature (May be dead)';
  } else if (temperature < 36.5 || temperature > 37.5) {
    healthStatus = 'Concerning Temperature';
  }

  
  if (heart_rate > 100) {
    healthStatus = 'High Heart Rate (Above Normal)';
  }

  const sql = 'INSERT INTO patients (name, age, temperature, heart_rate, healthStatus) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [name, age, temperature, heart_rate, healthStatus], function (err) {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ id: this.lastID, healthStatus });
  });
});

app.get('/patients', (req, res) => {
  
    const sql = 'SELECT * FROM patients';
    db.all(sql, [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json(rows);
    });
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
