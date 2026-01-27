export {};

declare global {
  interface Window {
    HSComboBox?: {
      autoInit?: () => void;
    };
  }
}
