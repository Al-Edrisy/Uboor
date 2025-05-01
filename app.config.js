export default ({ config }) => ({
  ...config,
  name: "uboor-mobile",
  slug: "uboor-mobile",
  version: "1.0.0",
  orientation: "portrait",
  expoClientId: "https://auth.expo.io/@al-edrisy/uboor-mobile",
  icon: "./assets/images/icon.png",
  scheme: "uboor-mobile",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    bundleIdentifier: "com.salehfree33.uboor_mobile",
    supportsTablet: true,
    associatedDomains: [
      "applinks:uboor-mobile.firebaseapp.com"
    ],
    config: {
      googleSignIn: {
        reservedClientId: "com.googleusercontent.apps.640873751207-hm5k0ne86ned9i3ge56alsc8rn54jpgm"
      }
    },
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true
      }
    }
  },
  android: {
    package: "com.salehfree33.uboor_mobile",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    intentFilters: [
      {
        action: "VIEW",
        data: [
          {
            scheme: "uboor-mobile",
            host: "*.firebaseapp.com"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    linking: {
      prefixes: [
        "uboor-mobile://",
        "https://uboor-mobile.firebaseapp.com"
      ],
      config: {
        screens: {
          SignInModal: "redirect",
        }
      }
    },
    authSessionRedirectScheme: "uboor-mobile",
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
  }
});