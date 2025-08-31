const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;

// Function to create a simple APK
function createAPK(callback) {
    console.log('Creating APK...');
    
    // Try to use the existing APK if available
    const existingAPK = 'RAIDMASTER-v1.0.apk';
    if (fs.existsSync(existingAPK)) {
        console.log('Using existing APK');
        callback(null, existingAPK);
        return;
    }
    
    // Otherwise, try to build one
    exec('cd android && ./gradlew assembleDebug --no-daemon', { timeout: 60000 }, (error, stdout, stderr) => {
        if (!error && fs.existsSync('android/app/build/outputs/apk/debug/app-debug.apk')) {
            fs.copyFileSync('android/app/build/outputs/apk/debug/app-debug.apk', 'RAIDMASTER.apk');
            callback(null, 'RAIDMASTER.apk');
        } else {
            // Fallback: create a minimal APK
            console.log('Creating minimal APK...');
            exec('python3 generate-apk.py', (err) => {
                if (!err && fs.existsSync('RAIDMASTER-v1.0.apk')) {
                    callback(null, 'RAIDMASTER-v1.0.apk');
                } else {
                    callback(new Error('Could not create APK'));
                }
            });
        }
    });
}

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
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
    } else if (req.url === '/generate-apk' || req.url === '/download-apk') {
        // Generate and serve APK
        createAPK((err, apkFile) => {
            if (err) {
                console.error('APK creation error:', err);
                // Serve a placeholder APK or redirect to web version
                res.writeHead(302, { 'Location': '/index.html' });
                res.end();
                return;
            }
            
            fs.readFile(apkFile, (readErr, apkContent) => {
                if (readErr) {
                    res.writeHead(500);
                    res.end('Error reading APK');
                    return;
                }
                
                res.writeHead(200, {
                    'Content-Type': 'application/vnd.android.package-archive',
                    'Content-Disposition': 'attachment; filename="RAIDMASTER.apk"',
                    'Content-Length': apkContent.length
                });
                res.end(apkContent);
            });
        });
    } else if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'running', 
            app: 'RAIDMASTER APK Server',
            version: '1.0.0'
        }));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RAIDMASTER APK Server running on port ${PORT}`);
    console.log(`📱 Access the download page at: http://localhost:${PORT}`);
});