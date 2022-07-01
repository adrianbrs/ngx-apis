import { isDevMode } from '@angular/core';

export function ngxApisMessage(message: string) {
  return `[NgxApis] ${message}`;
}

export function ngxApisError(message: string): never {
  throw new Error(ngxApisMessage(message));
}

export function ngxApisWarn(message: string) {
  if (isDevMode()) {
    console.warn(ngxApisMessage(message));
  }
}
