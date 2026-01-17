const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DB_FILE = path.join(__dirname, 'db.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.post('/submit', upload.single('screenshot'), (req, res) => {
  const db = readDB();
  const id = Date.now();
  const item = {
    id,
    name: req.body.name,
    phone: req.body.phone,
    webName: req.body.webName,
    webType: req.body.webType,
    opay: req.body.opay,
    screenshot: req.file ? req.file.filename : null,
    approved: false
  };
  db.push(item);
  writeDB(db);
  res.json({ message: 'Payment proof submitted. Wait for approval.' });
});

app.get('/pending', (req, res) => {
  const db = readDB();
  res.json(db.filter(x => !x.approved));
});

app.post('/approve', (req, res) => {
  const db = readDB();
  const id = req.body.id;
  const item = db.find(x => x.id === id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  item.approved = true;
  writeDB(db);
  res.json({ message: 'Approved' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
