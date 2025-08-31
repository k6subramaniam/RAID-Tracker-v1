const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.url === '/' || req.url === '/download') {
        // Serve the download page
        fs.readFile('apk-download-page.html', (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading page');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } else if (req.url === '/index.html') {
        // Serve the main app
        fs.readFile('index.html', (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } else if (req.url === '/generate-apk' || req.url === '/download-apk' || req.url.includes('.apk')) {
        // Serve the APK file
        const apkFiles = [
            'RAIDMASTER-WebView.apk',
            'RAIDMASTER-v1.0.apk',
            'RAIDMASTER.apk'
        ];
        
        let apkFile = null;
        for (const file of apkFiles) {
            if (fs.existsSync(file)) {
                apkFile = file;
                break;
            }
        }
        
        if (!apkFile) {
            console.log('No APK file found, creating one...');
            // Create a minimal APK if none exists
            require('child_process').execSync('./create-webview-apk.sh');
            apkFile = 'RAIDMASTER-WebView.apk';
        }
        
        fs.readFile(apkFile, (err, content) => {
            if (err) {
                console.error('Error reading APK:', err);
                res.writeHead(404);
                res.end('APK not found');
                return;
            }
            
            const stats = fs.statSync(apkFile);
            
            res.writeHead(200, {
                'Content-Type': 'application/vnd.android.package-archive',
                'Content-Disposition': `attachment; filename="RAIDMASTER.apk"`,
                'Content-Length': stats.size,
                'Cache-Control': 'no-cache'
            });
            res.end(content);
            
            console.log(`✅ Served APK: ${apkFile} (${stats.size} bytes)`);
        });
    } else if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'running', 
            app: 'RAIDMASTER APK Server',
            version: '1.0.0',
            apk_available: fs.existsSync('RAIDMASTER-WebView.apk')
        }));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RAIDMASTER APK Server running on port ${PORT}`);
    console.log(`📱 Download page available`);
    
    // Check if APK exists
    if (fs.existsSync('RAIDMASTER-WebView.apk')) {
        const stats = fs.statSync('RAIDMASTER-WebView.apk');
        console.log(`✅ APK ready: RAIDMASTER-WebView.apk (${(stats.size / 1024).toFixed(2)} KB)`);
    }
});