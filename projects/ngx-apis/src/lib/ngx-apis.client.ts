import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { ApiConfig } from './interfaces/api.interface';
import merge from 'lodash.merge';

export interface NgxApisClientRequest<T = any> {
  url?: string;
  method?: string;
  body?: T;
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  context?: HttpContext;
  observe?: string;
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: string;
  withCredentials?: boolean;
}

interface ResolvedRequest<T = any> extends NgxApisClientRequest<T> {
  url: string;
  headers: HttpHeaders;
  params: HttpParams;
}

export class NgxApisClient<T extends ApiConfig> {
  private _url: string;

  get url() {
    return this._url;
  }

  get metadata(): T['metadata'] {
    return this._config?.metadata;
  }

  constructor(private _http: HttpClient, private _config: T) {
    const baseURL = this._config?.baseURL ?? '';
    const url = this._config?.url ?? '';
    this._url = this.mergeUrls(baseURL, url);
  }

  protected mergeUrls(...urls: (string | null | undefined)[]): string {
    const validURLs = urls.filter((url) => !!url) as string[];
    if (!validURLs || !validURLs.length) {
      return '';
    }
    const initial = validURLs.shift()!;
    return validURLs.reduce((res, url) => {
      // Test for complete URL
      try {
        new URL(url);
        return url;
      } catch (_) {}

      return `${res.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
    }, initial);
  }

  createUrl(url: string) {
    return this.mergeUrls(this._url, url);
  }

  createUrlWithParams(
    url: string,
    params?: NgxApisClientRequest['params']
  ): string {
    let { url: urlWithParams, params: httpParams } = this.createRequest({
      url,
      params,
    });

    const strParams = httpParams.toString();
    if (strParams.length === 0) {
      return urlWithParams;
    }
    // Does the URL already have query parameters? Look for '?'.
    const qIdx = url.indexOf('?');
    // There are 3 cases to handle:
    // 1) No existing parameters -> append '?' followed by params.
    // 2) '?' exists and is followed by existing query string ->
    //    append '&' followed by params.
    // 3) '?' exists at the end of the url -> append params directly.
    // This basically amounts to determining the character, if any, with
    // which to join the URL and parameters.
    const sep: string = qIdx === -1 ? '?' : qIdx < url.length - 1 ? '&' : '';
    urlWithParams += sep + strParams;
    return urlWithParams;
  }

  private _normalizeRequest(
    request?: NgxApisClientRequest | null | undefined
  ): Omit<NgxApisClientRequest, 'headers' | 'params'> & {
    headers: Exclude<NgxApisClientRequest['headers'], HttpHeaders | undefined>;
    params: Exclude<NgxApisClientRequest['params'], HttpParams | undefined>;
  } {
    const { headers = {}, params = {}, ...options } = { ...(request ?? {}) };

    const isHttpHeaders = headers instanceof HttpHeaders;
    const isHttpParams = params instanceof HttpParams;

    const plainHeaders: Exclude<NgxApisClientRequest['headers'], HttpHeaders> =
      {};
    const plainParams: Exclude<NgxApisClientRequest['params'], HttpParams> = {};

    (isHttpHeaders ? headers.keys() : Object.keys(headers)).forEach((key) => {
      const value = isHttpHeaders ? headers.getAll(key)! : headers[key];
      merge(plainHeaders, { [key]: value });
    });

    (isHttpParams ? params.keys() : Object.keys(params)).forEach((key) => {
      const value = isHttpParams ? params.getAll(key)! : params[key];
      merge(plainParams, { [key]: value });
    });

    return {
      url: options.url,
      headers: plainHeaders,
      params: plainParams,
      body: options.body,
      context: options.context,
      observe: options.observe,
      reportProgress: options.reportProgress,
      responseType: options.responseType,
      withCredentials: options.withCredentials,
      method: options.method,
    };
  }

  createRequest<T>(...requests: NgxApisClientRequest<T>[]): ResolvedRequest<T> {
    if (requests.length === 0) {
      const {
        url: _,
        headers,
        params,
        ...options
      } = this._normalizeRequest(this._config.options);

      return {
        url: this._url,
        headers: new HttpHeaders(headers),
        params: new HttpParams({
          fromObject: params,
        }),
        ...options,
      };
    }

    let request: NgxApisClientRequest;
    let baseRequest: NgxApisClientRequest;

    if (requests.length === 1) {
      baseRequest = this._config.options ?? {};
      request = requests[0];
    } else {
      request = requests.pop()!;
      baseRequest = this.createRequest(...requests);
    }
    const { url, headers, params, ...overrideOptions } =
      this._normalizeRequest(request);
    const {
      url: baseUrl,
      headers: baseHeaders,
      params: baseParams,
      ...baseOptions
    } = this._normalizeRequest(baseRequest);

    const newHeaders = new HttpHeaders(merge({}, baseHeaders, headers));
    const newParams = new HttpParams({
      fromObject: merge({}, baseParams, params),
    });

    return {
      ...baseOptions,
      ...overrideOptions,
      url: this.mergeUrls(this._url, baseUrl, url),
      headers: newHeaders,
      params: newParams,
    };
  }

  createHttpRequest<T>(...requests: NgxApisClientRequest<T>[]): HttpRequest<T> {
    const { url, method, body, ...req } = this.createRequest(...requests);
    if (body != null) {
      return new HttpRequest(method as any, url!, body, req as any);
    }
    return new HttpRequest(method as any, url!, req as any);
  }

  get: HttpClient['get'] = (url: any, options: any) => {
    const { url: reqURL, ...req } = this.createRequest(options, { url });
    return this._http.get(reqURL!, req as any) as any;
  };

  post: HttpClient['post'] = (url: any, body: any, options: any) => {
    const { url: reqURL, ...req } = this.createRequest(options, { url });
    return this._http.post(reqURL!, body, req as any) as any;
  };

  put: HttpClient['put'] = (url: any, body: any, options: any) => {
    const { url: reqURL, ...req } = this.createRequest(options, { url });
    return this._http.put(reqURL!, body, req as any) as any;
  };

  delete: HttpClient['delete'] = (url: any, options: any) => {
    const { url: reqURL, ...req } = this.createRequest(options, { url });
    return this._http.delete(reqURL!, req as any) as any;
  };

  patch: HttpClient['patch'] = (url: any, body: any, options: any) => {
    const { url: reqURL, ...req } = this.createRequest(options, { url });
    return this._http.patch(reqURL!, body, req as any) as any;
  };

  head: HttpClient['head'] = (url: any, options: any) => {
    const { url: reqURL, ...req } = this.createRequest(options, { url });
    return this._http.head(reqURL!, req as any) as any;
  };

  options: HttpClient['options'] = (url: any, options: any) => {
    const { url: reqURL, ...req } = this.createRequest(options, { url });
    return this._http.options(reqURL!, req as any) as any;
  };

  request: HttpClient['request'] = ((
    methodOrReq: any,
    url: any,
    options: any
  ) => {
    if (typeof url !== 'undefined' || typeof options !== 'undefined') {
      const { url: reqURL, ...req } = this.createRequest(options, { url });
      return this._http.request(methodOrReq, reqURL!, req as any);
    }
    return this._http.request(this.createHttpRequest(methodOrReq) as any);
  }) as any;

  jsonp: HttpClient['jsonp'] = (url: string, callbackParam: string) => {
    return this._http.jsonp(this.createUrl(url), callbackParam);
  };
}
