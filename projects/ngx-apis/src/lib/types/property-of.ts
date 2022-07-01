export type PropertyOf<Endpoints, Key extends string> = Endpoints extends null | undefined
  ? undefined
  : Key extends keyof Endpoints
  ? Endpoints[Key]
  : unknown;
