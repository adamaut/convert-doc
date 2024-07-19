const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const docxToPdf = require('docx-pdf');

const app = express();
const port = 3000;

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for file upload and conversion
app.post('/convert', upload.single('docxFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, 'downloads', `${req.file.filename}.pdf`);

  docxToPdf(inputPath, outputPath, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error converting file.');
    }

    res.download(outputPath, 'converted.pdf', (err) => {
      if (err) {
        console.error(err);
      }
      // Clean up files after download
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});