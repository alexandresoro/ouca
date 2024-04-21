export type {};

// Additional global variables defined in the index.html file
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    APP_VERSION: string;
  }
}
