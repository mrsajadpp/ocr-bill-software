require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = 3001;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', upload.single('image'), async (req, res) => {
    const imagePath = req.file.path;
    const imageResp = fs.readFileSync(imagePath);

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: req.file.mimetype,
            },
        },
        'Extract the text in this image.',
    ]);

    const extractedText = result.response.text();
    fs.unlinkSync(imagePath); // Clean up the uploaded file

    res.render('result', { text: extractedText });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});