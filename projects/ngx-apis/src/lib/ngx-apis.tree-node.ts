import { HttpClient } from '@angular/common/http';
import { ApiConfig } from './interfaces/api.interface';
import { GetChildEndpoint } from './interfaces/get-endpoint.interface';
import { NgxApisClient } from './ngx-apis.client';
import merge from 'lodash.merge';

export class NgxApisTreeNode<
  Config extends ApiConfig = ApiConfig,
  Parent extends NgxApisTreeNode<any> | undefined = any
> {
  private _resolvedMap = new Map<string, NgxApisTreeNode<any>>();

  public readonly client: NgxApisClient<Config>;
  public readonly config: Config;

  get metadata(): Config['metadata'] {
    return this.config?.metadata;
  }

  constructor(
    private _http: HttpClient,
    config: Config,
    public parent: Parent
  ) {
    this.config = {
      baseURL:
        config.baseURL ??
        (parent?.config.baseURL ?? '') + (parent?.config.url ?? ''),
      url: config.url ?? '',
      endpoints: config.endpoints ?? {},
      metadata: config.metadata ?? {},
      options: merge({}, parent?.config.options, config.options),
    } as Config;

    this.client = new NgxApisClient(_http, this.config);
  }

  /**
   * Resolve a deeply-nested child endpoint.
   * @param path The path of the desired endpoint in dot notation.
   *
   * @example
   * declare const apiService: NgxApisService<ApiConfig<{
   *  endpoints: {
   *    nested: ApiConfig<{
   *      endpoints: {
   *        api: ApiConfig<{
   *          metadata: {
   *            someNestedMetadata: string
   *          }
   *        }>
   *      }
   *    }>
   *  }
   * }>>;
   *
   * const nestedEndpoint = apiService.resolve('nested.api');
   * console.log(nestedEndpoint.metadata.someNestedMetadata);
   */
  resolve<Path extends keyof Config['endpoints']>(
    path: Path
  ): GetChildEndpoint<NgxApisTreeNode<Config, Parent>, Extract<Path, string>>;
  resolve<Path extends string>(
    path: Path
  ): GetChildEndpoint<NgxApisTreeNode<Config, Parent>, Path>;
  resolve(path: string): NgxApisTreeNode | null;
  resolve(path: string): any {
    if (!this.config || !this.config.endpoints || typeof path !== 'string') {
      return null;
    }

    const sepIndex = path.indexOf('.');
    let currentPath: string;
    let nextPaths: string = '';

    if (sepIndex === -1) {
      currentPath = path;
    } else {
      currentPath = path.substring(0, sepIndex);
      nextPaths = path.substring(sepIndex + 1, path.length);
    }

    const nextConfig = this.config.endpoints[currentPath];
    if (!nextConfig) {
      return null;
    }

    let nextEndpoint = this._resolvedMap.get(currentPath)!;
    if (!nextEndpoint) {
      this._resolvedMap.set(
        currentPath,
        (nextEndpoint = new NgxApisTreeNode(this._http, nextConfig, this))
      );
    }

    // Recursively resolve child endpoints
    if (nextPaths.length > 0) {
      return nextEndpoint.resolve(nextPaths);
    }

    return nextEndpoint;
  }
}
