export type {};

// Additional global variables defined in the index.html file
declare global {
  interface Window {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    APP_VERSION: string;
  }
}
