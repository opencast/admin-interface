/**
 * Types for our user defined variables
 */
interface ImportMetaEnv {
  readonly VITE_TEST_SERVER_URL: string
  readonly VITE_TEST_SERVER_AUTH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
