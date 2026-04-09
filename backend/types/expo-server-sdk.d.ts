declare module "expo-server-sdk" {
  export default class Expo {
    static isExpoPushToken(token: string): boolean;
    chunkPushNotifications(messages: unknown[]): unknown[][];
    sendPushNotificationsAsync(chunk: unknown): Promise<unknown[]>;
  }
}
