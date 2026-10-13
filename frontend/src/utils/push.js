export async function registerPushNotifications() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;
    await navigator.serviceWorker.register('/sw.js');
    return true;
  } catch {
    return false;
  }
}

export function showLocalNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, { body });
}
