export default {
  expo: {
    name: "RAIDMASTER",
    slug: "raidmaster", 
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain", 
      backgroundColor: "#1976d2"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    android: {
      package: "com.raidmaster.app",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1976d2"
      }
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 21
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "4819f4f5-bfdc-4fa3-9c7b-1ac668e9c375"
      }
    }
  }
};