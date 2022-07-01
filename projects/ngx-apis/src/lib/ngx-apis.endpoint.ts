import { HttpClient } from '@angular/common/http';
import { ngxApisError, ngxApisWarn } from './logging';
import { NgxApisTreeNode } from './ngx-apis.tree-node';
import { ApiConfig } from './interfaces/api.interface';

export const NGX_API_NODE_SYMBOL = Symbol('__NgxApiTreeNode');

export abstract class NgxApisEndpoint<Config extends ApiConfig> {
  private readonly [NGX_API_NODE_SYMBOL]: NgxApisTreeNode<Config>;

  protected get client() {
    return this[NGX_API_NODE_SYMBOL].client;
  }

  protected get metadata() {
    return this[NGX_API_NODE_SYMBOL].metadata;
  }

  protected get config() {
    return this[NGX_API_NODE_SYMBOL].config;
  }

  /**
   * Creates a new API service from an existing API node.
   */
  constructor(apiNode: NgxApisTreeNode<Config>);

  /**
   * Creates a new API service with a new plain endpoint configuration.
   */
  constructor(config: Config, http: HttpClient);
  constructor(
    configOrNode: Config | NgxApisTreeNode<Config>,
    http?: HttpClient
  ) {
    if (!configOrNode) {
      ngxApisWarn(
        `No API configuration or endpoint provided for ${this.constructor.name}`
      );
    }

    if (configOrNode instanceof NgxApisTreeNode) {
      this[NGX_API_NODE_SYMBOL] = configOrNode;
    } else if (!http) {
      ngxApisError(
        `HttpClient must be provided when creating a new API endpoint from a plain endpoint configuration`
      );
    } else {
      this[NGX_API_NODE_SYMBOL] = new NgxApisTreeNode(
        http,
        configOrNode,
        undefined
      );
    }
  }
}
