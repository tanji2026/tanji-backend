const express = require('express');
const cors = require('cors');
// Vercel Node.js 18+ 環境已內建 fetch，但為了相容性保留
const fetch = require('node-fetch'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 啟用 CORS (允許所有來源連線，解決 GitHub Pages 跨域問題)
app.use(cors({
    origin: '*' 
}));

// 2. 氣象 API 代理路由
app.get('/api/weather', async (req, res) => {
    try {
        // 從環境變數讀取 API Key (安全性關鍵)
        const CWA_API_KEY = process.env.CWA_API_KEY;
        if (!CWA_API_KEY) {
            return res.status(500).json({ error: 'Server missing API Key configuration' });
        }

        // 呼叫中央氣象署 API (O-A0001-001 自動氣象站資料)
        const apiUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=${CWA_API_KEY}&limit=10&format=JSON`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// 3. 根目錄測試路由
app.get('/', (req, res) => {
    res.send('TanJi Backend is running!');
});

// 4. 匯出 app (這是 Vercel Serverless 的關鍵，不能只寫 app.listen)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Local server running on port ${PORT}`);
    });
}

module.exports = app;
