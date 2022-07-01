import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConfig, NgxApisService } from 'ngx-apis';

export type AppApiConfig = ApiConfig<{
  endpoints: {
    test: ApiConfig<{
      endpoints: {
        abc: ApiConfig<{
          metadata: {
            someMeta: string;
          };
          endpoints: {
            nested: ApiConfig<{
              metadata: {
                nestedMeta: number;
              };
            }>;
          };
        }>;
      };
      metadata: {
        testMeta: boolean;
      };
    }>;
  };
}>;

@Injectable({
  providedIn: 'root',
})
export class ApiService extends NgxApisService<AppApiConfig> {
  constructor(http: HttpClient) {
    super(
      {
        endpoints: {
          test: {
            baseURL: 'https://test.com',
            url: '/url',
            options: {
              params: {
                someParam: 'works',
              },
            },
            metadata: {
              testMeta: true,
            },
            endpoints: {
              abc: {
                url: '/abc',
                options: {
                  params: {
                    anotherParam: 'also_works',
                  },
                },
                metadata: {
                  someMeta: 'meta',
                },
                endpoints: {
                  nested: {
                    url: '/nested',
                    metadata: {
                      nestedMeta: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
      http
    );
  }
}
