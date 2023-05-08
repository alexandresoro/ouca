import * as Sentry from "@sentry/node";
import { type FastifyPluginCallback } from "fastify";
// eslint-disable-next-line import/no-named-as-default
import fastifyPlugin from "fastify-plugin";

const sentryMetricsPlugin: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.decorateRequest("sentry", null);
  fastify.addHook("onRequest", (request, reply, done) => {
    const transaction = Sentry.startTransaction({ name: request.routerPath, op: "http" });
    transaction.setData("http.method", request.method);
    transaction.setTag("http.method", request.method);

    const sentryData = {
      transaction,
    };

    request.sentry = sentryData;

    done();
  });

  fastify.addHook("onResponse", (request, reply, done) => {
    if (request.sentry) {
      const { transaction } = request.sentry;

      if (request.user != null) {
        transaction.setTag("userId", request.user.id);
      }

      transaction.setHttpStatus(reply.statusCode).finish();
    }

    done();
  });

  done();
};

export default fastifyPlugin(sentryMetricsPlugin);
