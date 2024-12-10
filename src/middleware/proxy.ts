import type { FastifyRequest, FastifyReply } from 'fastify';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services.config';
import { logger } from '../utils/logger';

interface ProxyConfig {
  target: string;
  pathRewrite?: { [key: string]: string };
  changeOrigin?: boolean;
}

interface ServiceConfig {
  url: string;
  pathRewrite?: { [key: string]: string };
}

export const setupProxies = (app: any) => {
  Object.entries(services).forEach(([service, config]: [string, ServiceConfig]) => {
    const proxyConfig: ProxyConfig = {
      target: config.url,
      pathRewrite: config.pathRewrite,
      changeOrigin: true
    };

    app.register(async (fastify: any) => {
      fastify.addHook('preHandler', async (request: FastifyRequest) => {
        logger.info(`Proxying request to ${service}: ${request.url}`);
      });

      fastify.register(createProxyMiddleware({
        pathRewrite: { [`^/api/${service}`]: '' },
        ...proxyConfig
      }));
    });
  });
};