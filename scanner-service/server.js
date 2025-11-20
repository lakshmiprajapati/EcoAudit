// scanner-service/server.js
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON bodies

// Basic Health Check Endpoint
app.get('/', (req, res) => {
    res.send('Scanner Service is Running...');
});

// The Core Scan Endpoint
app.post('/scan', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Received scan request for: ${url}`);

    try {
        // 1. Launch the browser
        const browser = await puppeteer.launch({
            headless: "new", // Run in background without UI
            args: ['--no-sandbox'] // Required for some server environments
        });

        // 2. Open a new page
        const page = await browser.newPage();

        // 3. Navigate to the URL (wait until network is idle for accurate measurement)
        await page.goto(url, { waitUntil: 'networkidle2' });

        // 4. Extract Basic Data (Title) - Just a test for now
        const pageTitle = await page.title();

        // 5. Close browser
        await browser.close();

        // 6. Send response
        res.json({
            success: true,
            url: url,
            title: pageTitle,
            message: "Puppeteer successfully visited the page!"
        });

    } catch (error) {
        console.error("Puppeteer Error:", error);
        res.status(500).json({ error: "Failed to scan website", details: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Scanner Service running on http://localhost:${PORT}`);
});