import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

const isExpoGo = Constants.appOwnership === 'expo';

// Solo configura se NON siamo in Expo Go
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Enregistrer le device pour les push notifications
 */
export const registerForPushNotifications = async (userId) => {
  // Skip in Expo Go
  if (isExpoGo) {
    console.log('Push notifications not available in Expo Go');
    return null;
  }

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  try {
    // Demander permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for push notifications');
      return null;
    }

    // Obtenir le token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    const token = tokenData.data;

    // Sauvegarder dans Supabase
    if (userId && token) {
      await savePushToken(userId, token);
    }

    // Config Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1E3A8A',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Sauvegarder le token push dans la DB
 */
export const savePushToken = async (userId, token) => {
  const { error } = await supabase
    .from('users')
    .update({ push_token: token })
    .eq('id', userId);

  if (error) {
    console.error('Error saving push token:', error);
  }
  return { error };
};

/**
 * Supprimer le token push (logout)
 */
export const removePushToken = async (userId) => {
  const { error } = await supabase
    .from('users')
    .update({ push_token: null })
    .eq('id', userId);

  return { error };
};

/**
 * Obtenir les paramètres de notification
 */
export const getNotificationSettings = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('notification_settings')
    .eq('id', userId)
    .single();

  return { 
    data: data?.notification_settings || {
      messages: true,
      announcements: true,
      bookings: true,
      grades: true,
      general: true,
    }, 
    error 
  };
};

/**
 * Mettre à jour les paramètres de notification
 */
export const updateNotificationSettings = async (userId, settings) => {
  const { error } = await supabase
    .from('users')
    .update({ notification_settings: settings })
    .eq('id', userId);

  return { error };
};

/**
 * Envoyer une notification push à un utilisateur
 */
export const sendPushNotification = async (userId, { title, body, data }) => {
  // Récupérer le token et les settings
  const { data: user } = await supabase
    .from('users')
    .select('push_token, notification_settings')
    .eq('id', userId)
    .single();

  if (!user?.push_token) {
    return { error: 'No push token' };
  }

  // Vérifier si ce type de notification est activé
  const notificationType = data?.type || 'general';
  const settings = user.notification_settings || {};
  
  if (settings[notificationType] === false) {
    return { error: 'Notification type disabled' };
  }

  // Envoyer via Expo Push API
  const message = {
    to: user.push_token,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    return { data: await response.json() };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Envoyer notification à plusieurs utilisateurs
 */
export const sendBulkPushNotifications = async (userIds, { title, body, data }) => {
  // Récupérer tous les tokens
  const { data: users } = await supabase
    .from('users')
    .select('id, push_token, notification_settings')
    .in('id', userIds)
    .not('push_token', 'is', null);

  if (!users || users.length === 0) {
    return { error: 'No users with push tokens' };
  }

  const notificationType = data?.type || 'general';

  // Filtrer par settings
  const messages = users
    .filter(user => {
      const settings = user.notification_settings || {};
      return settings[notificationType] !== false;
    })
    .map(user => ({
      to: user.push_token,
      sound: 'default',
      title,
      body,
      data,
    }));

  if (messages.length === 0) {
    return { error: 'All users have disabled this notification type' };
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    return { data: await response.json() };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Configurer les listeners de notification
 */
export const setupNotificationListeners = (onNotificationReceived, onNotificationResponse) => {
  const receivedSubscription = Notifications.addNotificationReceivedListener(onNotificationReceived);
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

/**
 * Obtenir le badge count
 */
export const getBadgeCount = async () => {
  return await Notifications.getBadgeCountAsync();
};

/**
 * Définir le badge count
 */
export const setBadgeCount = async (count) => {
  await Notifications.setBadgeCountAsync(count);
};