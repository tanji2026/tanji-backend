const express = require('express');
const cors = require('cors');
// Vercel Node.js 18+ 環境已內建 fetch，但為了相容性保留
const fetch = require('node-fetch'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));

// --- 新增：地址轉座標 API (Geocoding) ---
app.get('/api/geocode', async (req, res) => {
    try {
        const address = req.query.address;
        if (!address) return res.status(400).json({ error: 'Address is required' });

        // 使用 OpenStreetMap Nominatim API (免費、免 Key)
        // 必須設定 User-Agent 否則會被擋
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
        
        const response = await fetch(url, {
            headers: { 'User-Agent': 'TanJi-Climate-App/1.0' } 
        });
        const data = await response.json();

        if (data && data.length > 0) {
            res.json({
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                name: data[0].display_name
            });
        } else {
            res.status(404).json({ error: 'Address not found' });
        }
    } catch (error) {
        console.error('Geocode error:', error);
        res.status(500).json({ error: 'Geocoding failed' });
    }
});
// -------------------------------------------

// 2. 氣象 API 代理路由 (維持不變)
app.get('/api/weather', async (req, res) => {
    try {
        const CWA_API_KEY = process.env.CWA_API_KEY;
        if (!CWA_API_KEY) return res.status(500).json({ error: 'Server missing API Key configuration' });

        const apiUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=${CWA_API_KEY}&format=JSON`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.get('/', (req, res) => {
    res.send('TanJi Backend is running!');
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Local server running on port ${PORT}`);
    });
}

module.exports = app;
