import { NgxApisTreeNode } from '../ngx-apis.tree-node';
import { PropertyOf } from '../types/property-of';
import { Split } from '../types/split';
import { ApiConfig } from './api.interface';

type BaseGet<
  Endpoint extends NgxApisTreeNode,
  Keys extends readonly string[]
> = Keys extends []
  ? Endpoint
  : Keys extends readonly [infer Key]
  ? GetEndpoint<Endpoint, Extract<Key, string>>
  : Keys extends readonly [infer Head, ...infer Tail]
  ? BaseGet<
      GetEndpoint<Endpoint, Extract<Head, string>>,
      Extract<Tail, string[]>
    >
  : never;

type GetEndpoint<
  Endpoint extends NgxApisTreeNode<any, any>,
  Key extends string
> = Endpoint extends NgxApisTreeNode<infer Config>
  ? NgxApisTreeNode<
      Extract<PropertyOf<Config['endpoints'], Key>, ApiConfig>,
      Endpoint
    >
  : never;

/**
 * Get a deeply-nested endpoint instance.
 */
export type GetChildEndpoint<
  Endpoint extends NgxApisTreeNode<any, any>,
  Path extends string | readonly string[]
> = BaseGet<Endpoint, Path extends string ? Split<Path, '.'> : Path>;
