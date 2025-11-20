// scanner-service/server.js
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/scan', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    console.log(`Starting Carbon Scan for: ${url}`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();

        // --- DATA COLLECTION VARIABLES ---
        let totalBytes = 0;
        const resources = {
            'image': 0,
            'script': 0,
            'stylesheet': 0,
            'other': 0
        };

        // --- THE INTERCEPTOR ---
        // This event fires every time a file finishes downloading
        page.on('response', async (response) => {
            try {
                // 1. Get the resource type (e.g., 'image', 'script')
                const type = response.request().resourceType();
                
                // 2. Calculate size
                // We try to get the 'content-length' header (compressed size).
                // If missing, we use the buffer size (uncompressed fallback).
                const headers = response.headers();
                let size = 0;

                if (headers['content-length']) {
                    size = parseInt(headers['content-length'], 10);
                } else {
                    // Fallback: This is heavier but necessary if server uses chunked encoding
                    const buffer = await response.buffer();
                    size = buffer.length;
                }

                // 3. Add to totals
                totalBytes += size;
                if (resources[type] !== undefined) {
                    resources[type] += size;
                } else {
                    resources['other'] += size;
                }

            } catch (err) {
                // Some responses (like redirects) might fail to buffer, that's okay.
            }
        });

        // --- NAVIGATION ---
        // We wait for 'networkidle0' -> No network connections for at least 500ms
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        await browser.close();

        // --- REPORTING ---
        // Convert bytes to Megabytes for readability in logs
        const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
        console.log(`Scan Complete. Total: ${totalMB} MB`);

        res.json({
            success: true,
            url: url,
            metrics: {
                totalBytes: totalBytes,
                resources: resources
            }
        });

    } catch (error) {
        console.error("Scan Error:", error);
        if (browser) await browser.close();
        res.status(500).json({ error: "Scan failed", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Carbon Scanner running on port ${PORT}`);
});