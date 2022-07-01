import type { PropertyOf } from '../types/property-of';
import type { Split } from '../types/split';
import { ApiConfig, ApiEndpoints } from './api.interface';

type BaseGet<Endpoints extends ApiEndpoints | undefined, Keys extends readonly string[]> = Endpoints extends ApiEndpoints
  ? Keys extends []
    ? Endpoints
    : Keys extends readonly [infer Key]
    ? PropertyOf<Endpoints, Extract<Key, string>>
    : Keys extends readonly [infer Head, ...infer Tail]
    ? BaseGet<NonNullable<PropertyOf<Endpoints, Extract<Head, string>>['endpoints']>, Extract<Tail, string[]>>
    : never
  : never;

/**
 * Get a deeply-nested endpoint config.
 */
export type GetApiConfig<BaseType extends ApiEndpoints | ApiConfig, Path extends string | readonly string[]> = Extract<
  BaseGet<BaseType extends ApiEndpoints ? BaseType : BaseType['endpoints'], Path extends string ? Split<Path, '.'> : Path>,
  ApiConfig
>;
