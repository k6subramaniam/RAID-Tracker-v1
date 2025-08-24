# RAIDMASTER - RAID Management App

A modern, fast, and intuitive RAID (Risks, Assumptions, Issues, Dependencies) management app optimized for Samsung Galaxy S25 Ultra and Android devices.

## Features

### Core Functionality
- **RAID Item Management**: Create, track, and manage Risks, Assumptions, Issues, and Dependencies
- **Smart Filtering**: Multi-dimensional filtering by type, status, priority, workstream, owner
- **Priority Calculation**: Automatic severity scoring based on impact and likelihood
- **Status Tracking**: Full lifecycle management from Proposed to Archived

### AI-Powered Features
- **AI Analysis**: Intelligent analysis of RAID items with priority recommendations
- **Data Validation**: Automatic quality checks and completeness validation
- **Smart Suggestions**: AI-driven insights for risk mitigation and issue resolution
- **Confidence Scoring**: Transparency in AI recommendations with confidence levels

### Reporting & Visualization
- **RAID Matrix**: Visual 2D heatmap showing probability vs impact distribution
- **Executive Reports**: Generate comprehensive summaries with key metrics
- **Export Capabilities**: Copy reports to clipboard for easy sharing
- **Quick Stats**: Real-time dashboard with critical metrics

### User Experience
- **Mobile-First Design**: Optimized for touch interaction and mobile screens
- **Dark Mode Support**: Automatic theme switching based on device settings
- **Offline Support**: Full functionality with local data persistence
- **Gesture Controls**: Swipe actions and pull-to-refresh

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand with AsyncStorage persistence
- **UI Components**: React Native Paper (Material Design 3)
- **Navigation**: React Navigation v7
- **Date Handling**: date-fns
- **Charts**: react-native-chart-kit

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI for building (`npm install -g eas-cli`)

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd raidmaster
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

## Building for Production

### 🚀 GitHub Actions (Recommended)

The easiest way to build APKs is using our automated GitHub Actions:

1. **Automatic Builds**: Push to main branch → APK builds automatically
2. **Manual Builds**: Go to Actions tab → Run "Manual APK Build"  
3. **Releases**: Create a tag (v1.0.0) → Full release with APKs

**Quick Start:**
1. Set up `EXPO_TOKEN` secret in GitHub repo settings
2. Push code or run manual build
3. Download APK from Actions or Releases

See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for detailed instructions.

### Android APK Build

#### Option 1: Using EAS Build (Local)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure the project:
```bash
eas build:configure
```

4. Build the APK:
```bash
eas build --platform android --profile production
```

5. Download the APK from the provided URL once the build is complete.

#### Option 2: Local Build with Expo

1. Install Expo CLI globally:
```bash
npm install -g expo-cli
```

2. Build locally:
```bash
expo build:android -t apk
```

3. Follow the prompts to generate a keystore or use an existing one.

4. Download the APK from the provided URL.

#### Option 3: Bare Workflow (Advanced)

1. Eject to bare workflow:
```bash
expo eject
```

2. Navigate to android directory:
```bash
cd android
```

3. Build the APK:
```bash
./gradlew assembleRelease
```

4. Find the APK in `android/app/build/outputs/apk/release/`

## Installation on Samsung Galaxy S25 Ultra

1. **Enable Developer Options**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Enter your PIN/password when prompted

2. **Enable USB Debugging**:
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
   - Enable "Install via USB" if present

3. **Install the APK**:
   
   **Method 1: Direct Download**
   - Download the APK file to your phone
   - Open Files app and navigate to Downloads
   - Tap the APK file
   - Allow installation from unknown sources if prompted
   - Complete the installation

   **Method 2: Using ADB**
   ```bash
   adb install raidmaster.apk
   ```

   **Method 3: Using USB**
   - Connect phone to computer via USB
   - Transfer APK to phone storage
   - Use a file manager to install

## Configuration

### AI Configuration
The app includes customizable AI settings:
- System instructions
- Analysis and validation prompts
- Tone settings (Conservative/Balanced/Assertive)
- Auto-apply threshold
- Validation strictness

### Theme Configuration
- Automatic theme switching based on device settings
- Manual light/dark mode selection
- Custom color schemes for different RAID types

### Data Management
- Local storage using AsyncStorage
- Automatic data persistence
- Export/import capabilities for backup

## Usage Guide

### Creating RAID Items
1. Tap the FAB (+) button
2. Select item type (Risk/Assumption/Issue/Dependency)
3. Follow the guided multi-step form
4. Review and submit

### Managing Items
- **View Details**: Tap any item in the list
- **Quick Actions**: Swipe left/right for common actions
- **Bulk Operations**: Long press to select multiple items
- **AI Analysis**: Use the robot icon to analyze items

### Generating Reports
1. Navigate to Reports tab
2. Select report type
3. Apply filters if needed
4. Export to clipboard or save

### Using the Calculator
1. Go to Calculator tab
2. Select Impact and Likelihood levels
3. View calculated severity and priority
4. Apply to new items directly

## Performance Optimization

- Virtualized lists for large datasets
- Lazy loading of screens
- Optimized re-renders with React.memo
- Efficient state updates with Zustand
- Image caching and optimization

## Security Considerations

- No sensitive data logging
- Secure storage for AI configurations
- Input validation and sanitization
- Safe URL handling for references

## Troubleshooting

### Common Issues

1. **App crashes on startup**:
   - Clear app cache and data
   - Reinstall the app
   - Check for sufficient storage space

2. **AI features not working**:
   - Check AI configuration settings
   - Ensure proper network connectivity
   - Reset AI config to defaults

3. **Data not persisting**:
   - Check storage permissions
   - Verify AsyncStorage is working
   - Export data as backup

## Contributing

Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, issues, or feature requests, please contact the development team.

## Version History

- **1.0.0** (Current)
  - Initial release
  - Full RAID management functionality
  - AI-powered analysis
  - Comprehensive reporting
  - Mobile-optimized UI

## Roadmap

- Voice input for item creation
- Cloud sync and backup
- Team collaboration features
- Advanced analytics dashboard
- Integration with project management tools
- Multi-language support