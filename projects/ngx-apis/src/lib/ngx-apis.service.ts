import { ApiConfig } from './interfaces/api.interface';
import { NgxApisEndpoint, NGX_API_NODE_SYMBOL } from './ngx-apis.endpoint';

/**
 * Base class for implementing an API service.
 */
export class NgxApisService<
  Config extends ApiConfig = ApiConfig
> extends NgxApisEndpoint<Config> {
  public get apiNode() {
    return this[NGX_API_NODE_SYMBOL];
  }

  public override get client() {
    return this.apiNode.client;
  }

  public override get metadata() {
    return this.apiNode.metadata;
  }

  public resolve: typeof this['apiNode']['resolve'] = (path: string) =>
    this.apiNode.resolve(path) as any;
}
