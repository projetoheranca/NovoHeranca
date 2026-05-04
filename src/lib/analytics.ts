// Define the window property for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
  }
}

/**
 * Pushes an event to the Google Tag Manager DataLayer.
 * @param eventName The name of the event (e.g., 'begin_signup', 'cta_click')
 * @param data Additional data payload for the event
 */
export const pushToDataLayer = (eventName: string, data: Record<string, any> = {}) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...data,
    });
  }
};
