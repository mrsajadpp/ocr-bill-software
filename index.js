require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const xlsx = require('xlsx');

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

    // Read the Excel file
    const workbook = xlsx.readFile(path.join(__dirname, 'Component_Prices_Demo_INR.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const componentsData = xlsx.utils.sheet_to_json(sheet);

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: req.file.mimetype,
            },
        },
        {
            inlineData: {
                data: Buffer.from(JSON.stringify(componentsData)).toString("base64"),
                mimeType: 'text/plain',
            },
        },
        'Extract the components, quantities, and prices from the image and Excel file, and calculate the total cost.',
    ]);

    try {
        res.render('result', { text: result.response.text() });
    } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});