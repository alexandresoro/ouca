import { captureException, captureMessage, getCurrentHub, runWithAsyncContext, startTransaction } from "@sentry/node";
import type { FastifyPluginCallback } from "fastify";
import fastifyPlugin from "fastify-plugin";

const sentry: FastifyPluginCallback = (fastify, options, next) => {
  fastify.addHook("onRequest", (request, reply, done) => {
    return runWithAsyncContext(() => {
      const transaction = startTransaction({ name: request.routeOptions.url, op: "http" });
      transaction.setData("http.method", request.method);
      transaction.setTag("http.method", request.method);

      getCurrentHub().configureScope((scope) => {
        scope.setSpan(transaction);
      });

      done();
    });
  });

  fastify.addHook("onResponse", (request, reply, done) => {
    return runWithAsyncContext(() => {
      const transaction = getCurrentHub().getScope()?.getSpan();

      // Report 5xx errors to Sentry as warnings
      if (reply.statusCode >= 500) {
        captureMessage("HTTP response 5xx returned", {
          level: "warning",
          fingerprint: ["{{ default }}", transaction?.name ?? request.url, request.method, reply.statusCode.toString()],
          tags: {
            statusCode: reply.statusCode,
          },
          user: request.user ?? undefined,
        });
      }

      if (transaction) {
        if (request.user != null) {
          transaction.setTag("userId", request.user.id);
        }
        transaction.setHttpStatus(reply.statusCode).finish();
      }

      done();
    });
  });

  fastify.addHook("onError", (request, reply, error, done) => {
    return runWithAsyncContext(() => {
      // Capture errors thrown inside Fastify
      captureException(error);

      const transaction = getCurrentHub().getScope()?.getSpan();

      if (transaction) {
        transaction.setHttpStatus(reply.statusCode).finish();
      }

      done();
    });
  });

  next();
};

export default fastifyPlugin(sentry, {
  fastify: "4.x",
  name: "@sentry/fastify",
});
