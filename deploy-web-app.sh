#!/bin/bash

echo "🌐 Deploying RAIDMASTER as a Web App..."
echo ""
echo "This web app can be converted to APK using online tools!"
echo ""

# Create a simple web deployment
mkdir -p web-deploy
cp index.html web-deploy/
cp htmlContent.js web-deploy/

# Create a simple manifest for PWA
cat > web-deploy/manifest.json << 'EOF'
{
  "name": "RAIDMASTER",
  "short_name": "RAIDMASTER",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#5D5CDE",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOF

# Create a simple icon using ImageMagick or fallback
if command -v convert &> /dev/null; then
    convert -size 192x192 xc:'#5D5CDE' -fill white -gravity center -pointsize 80 -annotate +0+0 'R' web-deploy/icon-192.png
    convert -size 512x512 xc:'#5D5CDE' -fill white -gravity center -pointsize 200 -annotate +0+0 'R' web-deploy/icon-512.png
else
    echo "⚠️  ImageMagick not found, skipping icon generation"
fi

# Update HTML to include manifest
sed -i '/<head>/a <link rel="manifest" href="manifest.json">' web-deploy/index.html 2>/dev/null || \
sed -i '' '/<head>/a\
<link rel="manifest" href="manifest.json">' web-deploy/index.html 2>/dev/null || \
echo "Note: Could not add manifest link automatically"

echo "✅ Web app prepared in web-deploy/ directory"
echo ""
echo "📱 Convert to APK using these services:"
echo ""
echo "1. 🔗 PWA to APK (Recommended):"
echo "   https://www.pwabuilder.com/"
echo "   - Upload your web app"
echo "   - It will generate an APK for you"
echo ""
echo "2. 🔗 Web2APK:"
echo "   https://web2apk.io/"
echo "   - Enter your web app URL"
echo "   - Customize settings"
echo "   - Download APK"
echo ""
echo "3. 🔗 AppsGeyser:"
echo "   https://appsgeyser.com/"
echo "   - Create HTML app"
echo "   - Upload your HTML file"
echo "   - Get APK instantly"
echo ""
echo "4. 🔗 GoodBarber:"
echo "   https://www.goodbarber.com/"
echo "   - Progressive Web App option"
echo "   - Convert to native app"
echo ""
echo "📝 Your HTML file is ready at: web-deploy/index.html"
echo "Upload this file to any of the services above to get your APK!"