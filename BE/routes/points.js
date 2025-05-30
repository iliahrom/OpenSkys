const express = require('express');
const router = express.Router();
const db = require('../dbSingleton'); // או הנתיב שלך לקובץ החיבור

router.get('/', (req, res) => {
  const connection = db.getConnection();

  const sql = 'SELECT id, name, row, col FROM points ORDER BY id ASC';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

module.exports = router;


