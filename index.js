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
}); // Home Page

function parseJsonFromMarkdown(markdownContent) {
    const jsonStringMatch = markdownContent.match(/```json\s([\s\S]+?)```/);

    if (jsonStringMatch) {
        const jsonString = jsonStringMatch[1];
        try {
            const jsonObject = JSON.parse(jsonString);
            return jsonObject;
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return null;
        }
    } else {
        console.log('No JSON found in the markdown content');
        return null;
    }
}; // Parse Json From Markdown

app.post('/upload', upload.single('image'), async (req, res) => {
    const imagePath = req.file.path;
    const imageResp = fs.readFileSync(imagePath);

    const workbook = xlsx.readFile(path.join(__dirname, 'Component_Prices_Demo_INR.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const componentsData = xlsx.utils.sheet_to_json(sheet);

    try {
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
            `Extract the components and their quantities from the uploaded image and match them with the prices listed in the provided Excel file. For each component, calculate the total price by multiplying the unit price by the quantity. Return the result in the following JSON format:

{
  "currency": "INR",
  "items": [
    {
      "name": "Component Name",
      "unit_price": "Price per unit in INR",
      "quantity": "Quantity requested",
      "total_price": "Calculated total price for that component"
    }
  ],
  "unavailable_items": [
    {
      "name": "Component Name",
      "quantity": "Quantity requested"
    }
  ],
  "total": "Total calculated price for all components"
}
If any items are not found in the Excel file, insert the item name into the unavailable_items array. If the handwriting in the image is unclear or if text cannot be extracted, respond with 'I can't understand your handwriting.' Avoid adding extra responses, such as chatting, questions, or irrelevant information.`,
        ]);

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });

        let responseJson = parseJsonFromMarkdown(result.response.text());

        res.render('result', { result: responseJson });
    } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).send('Internal Server Error');
    }
}); // Upload Image and Generate Content

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); // Listen to Port