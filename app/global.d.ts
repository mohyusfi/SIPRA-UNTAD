declare module '@tanstack/router-core' {
  interface UpdatableRouteOptionsExtensions {
    server?: {
      middleware?: any[]
      handlers?: {
        GET?: (ctx: { request: Request; params?: any }) => Promise<Response> | Response
        POST?: (ctx: { request: Request; params?: any }) => Promise<Response> | Response
        PUT?: (ctx: { request: Request; params?: any }) => Promise<Response> | Response
        PATCH?: (ctx: { request: Request; params?: any }) => Promise<Response> | Response
        DELETE?: (ctx: { request: Request; params?: any }) => Promise<Response> | Response
        [key: string]: any
      }
    }
  }
}
