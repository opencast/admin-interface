import { setupServer } from 'msw/node';
import { rest, RestHandler, RestRequest, ResponseComposition, RestContext } from 'msw';
import type { ResponseResolver } from 'msw';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

interface HandlerConfig {
  method?: HttpMethod;
  path: string | RegExp;
  res: (
    req: RestRequest,
    res: ResponseComposition,
    ctx: RestContext
  ) => ReturnType<ResponseComposition>;
}

export function createServer(handlerConfig: HandlerConfig[]) {
  const handlers: RestHandler[] = handlerConfig.map((config) => {
    const method = config.method || 'get';
    return rest[method](config.path, (req, res, ctx) => {
      return res(ctx.json(config.res(req, res, ctx)));
    });
  });

  const server = setupServer(...handlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
}
