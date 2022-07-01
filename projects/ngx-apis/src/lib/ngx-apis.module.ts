import { ModuleWithProviders, NgModule } from '@angular/core';
import { ApiConfig } from './interfaces/api.interface';
import { NGX_APIS_CONFIG } from './ngx-apis.constants';
import { NgxApisService } from './ngx-apis.service';
import { HttpClient } from '@angular/common/http';

export function defaultApiServiceFactory(http: HttpClient, config: ApiConfig) {
  return new NgxApisService(config, http);
}

@NgModule({})
export class NgxApisModule {
  static forRoot(config: ApiConfig): ModuleWithProviders<NgxApisModule> {
    return {
      ngModule: NgxApisModule,
      providers: [
        {
          provide: NGX_APIS_CONFIG,
          useValue: config,
        },
        {
          provide: NgxApisService,
          useFactory: defaultApiServiceFactory,
          deps: [HttpClient, NGX_APIS_CONFIG],
        },
      ],
    };
  }
}
