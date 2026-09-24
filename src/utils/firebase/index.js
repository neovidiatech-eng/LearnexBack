
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { log } from "node:console";

export const getFirebaseServiceAccount = () => {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
    return null;
  }

  return {
    type: process.env.FIREBASE_TYPE || "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };
};

let firebaseApp;

export const getAdmin = () => {
  if (firebaseApp) {
    return firebaseApp;
  }
  const serviceAccount = getFirebaseServiceAccount();

  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
 
    
    return firebaseApp;
  }

  if (
    !serviceAccount?.project_id ||
    !serviceAccount?.client_email ||
    !serviceAccount?.private_key
  ) {
    console.warn("⚠️ Firebase service account config missing. Skipping Firebase init.");
    return null;
  }

  firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  });
  if (firebaseApp) {
    console.log("✅ Firebase initialized successfully");
  } else {
    console.log("❌ Firebase initialization failed");
  }

  return firebaseApp;
};

/**
 * Send FCM Push Notification to single or multiple tokens
 */
export const sendPushNotification = async ({
  fcmToken,
  fcmTokens,
  title,
  body,
  data = {},
}) => {
  try {
    const app = getAdmin();
    if (!app) return null;

    const messaging = getMessaging(app);

    const stringData = data
      ? Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v ?? "")]),
        )
      : {};

    if (fcmToken) {
      const message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: stringData,
      };
      const response = await messaging.send(message);
      console.log("📲 FCM Push Sent Successfully:", response);
      return response;
    }

    if (Array.isArray(fcmTokens) && fcmTokens.length > 0) {
      const validTokens = fcmTokens.filter(Boolean);
      if (validTokens.length === 0) return null;

      const message = {
        tokens: validTokens,
        notification: {
          title,
          body,
        },
        data: stringData,
      };
      const response = await messaging.sendEachForMulticast(message);
      console.log(
        `📲 FCM Multicast Sent: ${response.successCount}/${validTokens.length} successful`,
      );
      return response;
    }
  } catch (error) {
    console.error("❌ FCM Push Notification Error:", error.message || error);
  }
};