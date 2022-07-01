/**
 * API endpoint extra configurations used to define sub endpoints and metadata
 */
export interface ApiConfigExtras {
  endpoints?: ApiEndpoints;
  metadata?: ApiMetadata;
}

/**
 * API endpoint configuration.
 */
export type ApiConfig<Extras extends ApiConfigExtras | undefined = undefined> = {
  baseURL?: string;
  url?: string;
  options?: {
    headers?: { [header: string]: string | string[] };
    params?: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    withCredentials?: boolean;
  };
} & (Extras extends ApiConfigExtras ? Extras : ApiConfigExtras);

/**
 * API endpoint metadata
 */
export type ApiMetadata = Record<string, any>;

/**
 * API endpoints definitions
 */
export type ApiEndpoints<T extends Record<string, ApiConfig> = { [endpoint: string]: ApiConfig }> = {
  [K in keyof T]: T[K];
};
