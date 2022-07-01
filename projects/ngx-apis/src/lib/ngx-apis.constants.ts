import { InjectionToken } from '@angular/core';
import { ApiConfig } from './interfaces/api.interface';

export const NGX_APIS_CONFIG = new InjectionToken<ApiConfig>('NGX_APIS_CONFIG');
