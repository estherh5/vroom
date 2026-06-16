/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_KEY: string;
  readonly VITE_RAPIDAPI_KEY?: string;
  readonly VITE_RENTAL_API_PROVIDER?: "booking" | "demo";
  readonly VITE_SERVER_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
