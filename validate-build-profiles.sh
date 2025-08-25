#!/bin/bash

# Build Profile Validation Script
echo "=========================================="
echo "RAIDMASTER Build Profile Validation"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Checking eas.json build profiles...${NC}"
echo ""

# Check each profile
profiles=("development" "preview" "apk" "apk-unsigned" "production")

for profile in "${profiles[@]}"; do
    if grep -q "\"$profile\":" eas.json; then
        echo -e "${GREEN}✅ $profile${NC} - Found"
        
        # Check Android configuration
        if grep -A10 "\"$profile\":" eas.json | grep -q "android"; then
            echo "   📱 Android configuration: Present"
        else
            echo "   ⚠️  Android configuration: Missing"
        fi
        
        # Check withoutCredentials setting
        if grep -A10 "\"$profile\":" eas.json | grep -q "withoutCredentials"; then
            creds=$(grep -A10 "\"$profile\":" eas.json | grep "withoutCredentials" | grep -o 'true\|false')
            if [ "$creds" = "true" ]; then
                echo "   🔓 Credentials: Not required (GitHub Actions compatible)"
            else
                echo "   🔐 Credentials: Required (needs EAS login)"
            fi
        else
            echo "   🔐 Credentials: Required by default"
        fi
    else
        echo -e "${YELLOW}❌ $profile${NC} - Not found"
    fi
    echo ""
done

echo "=========================================="
echo "Profile Usage Recommendations:"
echo "=========================================="
echo "🔓 apk-unsigned    - Quick testing (no login needed)"
echo "🔓 development     - Development builds (no login needed)"  
echo "🔐 preview         - Internal distribution (login required)"
echo "🔐 apk            - Release testing (login required)"
echo "🔐 production     - Play Store AAB (login required)"
echo ""
echo "Legend: 🔓 = No credentials needed, 🔐 = EAS login required"