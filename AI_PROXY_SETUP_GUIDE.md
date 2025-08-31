# AI Proxy Server Setup Guide for RAIDMASTER

## Overview
The AI Proxy Server solves CORS (Cross-Origin Resource Sharing) issues that prevent the RAIDMASTER PWA from directly calling AI APIs (OpenAI, Anthropic, Gemini) from the browser. This proxy server runs alongside the main PWA and forwards AI API requests, bypassing browser security restrictions.

## 🚀 Quick Start

### 1. Services Status
Two services are now running:
- **PWA Server**: https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev (Main RAIDMASTER app)
- **AI Proxy Server**: https://3001-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev (AI API proxy)

### 2. How It Works
1. When you trigger an AI analysis in RAIDMASTER
2. The app first checks if the AI proxy server is available
3. If available, it routes the API call through the proxy (port 3001)
4. If not available, it attempts a direct API call (which may fail due to CORS)
5. A green "✅ AI Proxy Active" indicator appears when using the proxy

## 📋 Requirements

### For Local Development
```bash
# Install dependencies
npm install express cors axios

# Start the AI proxy server
pm2 start ai-proxy-server.js --name "ai-proxy"

# Start the PWA server
pm2 start pwa-server.js --name "pwa-server"

# Check status
pm2 status
```

### For Android APK
When the app is packaged as an APK:
- The proxy server needs to be hosted separately (cloud service)
- Or implement a native bridge for API calls in the WebView
- Or use a mobile-specific CORS proxy solution

## 🔧 Configuration

### API Keys Setup
1. Open RAIDMASTER in your browser
2. Go to the Settings tab
3. Configure your AI provider API keys:
   - OpenAI API Key
   - Anthropic API Key
   - Google Gemini API Key

### Supported AI Providers
- **OpenAI**: GPT-3.5-turbo, GPT-4
- **Anthropic**: Claude-3-haiku, Claude-3-sonnet
- **Google Gemini**: Gemini Pro

## 🛠️ Technical Details

### Proxy Server Architecture
```javascript
// The proxy server handles:
POST /api/ai-proxy      // Generic proxy endpoint
POST /api/openai        // OpenAI-specific endpoint
POST /api/anthropic     // Anthropic-specific endpoint
POST /api/gemini        // Gemini-specific endpoint
GET  /health           // Health check endpoint
```

### Client-Side Integration
The `callAI` function in index.html automatically:
1. Detects proxy availability
2. Routes requests through proxy when available
3. Falls back to direct calls if proxy is unavailable
4. Shows visual feedback for proxy usage

### Security Considerations
- API keys are sent through the proxy (use HTTPS in production)
- Implement rate limiting for production use
- Add authentication to the proxy server for public deployment
- Consider IP whitelisting for additional security

## 🚨 Troubleshooting

### CORS Error Still Appearing
1. Check if both servers are running: `pm2 status`
2. Verify proxy health: `curl http://localhost:3001/health`
3. Check browser console for specific error messages
4. Ensure API keys are properly configured in Settings

### AI Proxy Not Detected
1. Check if port 3001 is accessible
2. Verify the proxy URL pattern matches your environment
3. Check for firewall or network restrictions
4. Restart the proxy server: `pm2 restart ai-proxy`

### API Calls Failing Through Proxy
1. Verify API keys are valid and have credits
2. Check proxy server logs: `pm2 logs ai-proxy --lines 50`
3. Test API keys directly with curl
4. Ensure proper internet connectivity

## 📱 Mobile Deployment Options

### Option 1: Cloud-Hosted Proxy
Deploy the AI proxy server to a cloud service:
- Heroku, Vercel, or Railway for easy deployment
- Configure CORS to allow your app domain
- Update the proxy URL in the app

### Option 2: Bundled Local Server (Advanced)
For Android APK:
- Use Capacitor or Cordova plugins for local server
- Bundle the proxy server with the app
- Configure WebView to allow localhost connections

### Option 3: Native Bridge
Implement native code to handle API calls:
- Create a JavaScript interface in WebView
- Handle API calls in native Android/iOS code
- Return results to JavaScript

## 🔄 Updates and Maintenance

### Updating the Proxy Server
```bash
# Stop the server
pm2 stop ai-proxy

# Update the code
# Edit ai-proxy-server.js as needed

# Restart the server
pm2 restart ai-proxy

# Save PM2 configuration
pm2 save
```

### Monitoring
```bash
# View real-time logs
pm2 logs ai-proxy

# Monitor CPU and memory
pm2 monit

# Check server health
curl http://localhost:3001/health
```

## 📝 Notes

- The proxy server is currently configured for development use
- For production, implement proper authentication and rate limiting
- Consider using environment variables for sensitive configuration
- The proxy automatically handles all three AI providers
- Visual indicators show when the proxy is active

## 🎯 Next Steps

1. **For PWA Testing**: The current setup works perfectly for testing AI features
2. **For APK Deployment**: Choose one of the mobile deployment options above
3. **For Production**: Add security layers and deploy to a cloud service

## Support

If you encounter issues:
1. Check the console logs in browser DevTools
2. Review PM2 logs: `pm2 logs --lines 100`
3. Verify network connectivity
4. Ensure API keys have available credits

The AI proxy server successfully bypasses CORS restrictions, enabling full AI functionality in the RAIDMASTER PWA!