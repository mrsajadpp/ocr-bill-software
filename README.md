# OCR Bill Software

A software for generating OCR-based bills by extracting components and their quantities from an uploaded image and matching them with prices listed in an Excel file.

## Features

- Upload an image containing handwritten or printed text.
- Extract components and their quantities from the image.
- Match extracted components with prices listed in an Excel file.
- Calculate the total price for each component and the overall total.
- Handle unavailable items and unclear handwriting.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/mrsajadpp/ocr-bill-software.git
    cd ocr-bill-software
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your Google Generative AI API key:
    ```env
    API_KEY=your_api_key_here
    ```

4. Ensure you have the `Component_Prices_Demo_INR.xlsx` file in the root directory.

## Usage

1. Start the server:
    ```sh
    npm start
    ```

2. Open your browser and navigate to `http://localhost:3001`.

3. Upload an image containing the components and their quantities.

4. View the generated bill with calculated prices.

## Project Structure

- `index.js`: Main server file.
- `views/`: Directory containing EJS templates.
- `uploads/`: Directory for storing uploaded images temporarily.

## Dependencies

- `@google/generative-ai`: Google Generative AI library.
- `dotenv`: Loads environment variables from a `.env` file.
- `ejs`: Embedded JavaScript templating.
- `express`: Web framework for Node.js.
- `fs`: File system module.
- `multer`: Middleware for handling `multipart/form-data`.
- `nodemon`: Utility that monitors for changes in the source code and automatically restarts the server.
- `path`: Utility for working with file and directory paths.
- `xlsx`: Library for parsing and writing Excel files.

## License

This project is licensed under the Apache-2.0 License.
