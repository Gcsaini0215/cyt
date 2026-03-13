import { postData } from "./actions";

const VAPID_PUBLIC_KEY = "BM-eSBc4K9UwksrkgfGhkCYlz6zcSo8qdWflowLTDB6CZ07cMnCIcBr_9hTPUaBhMnzKFM7DtR3cvcM1K3pUivA";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeToNotifications = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser.");
    return;
  }

  try {
    // 1. Permission request
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      
      // 2. Wait for Service Worker to be ready
      const registration = await navigator.serviceWorker.ready;
      
      // 3. Generate Push Subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Send subscription to backend
      await postData("https://api.chooseyourtherapist.in/api/notifications/subscribe", subscription);
      console.log("Notifications enabled and synced with backend.");
      return true;
    } else {
      console.error("Permission denied for notifications.");
      return false;
    }
  } catch (error) {
    console.error("Error during push subscription:", error);
    return false;
  }
};
