import { type FastifyPluginCallback } from "fastify";
import { type Services } from "../services/services.js";

const userController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { userService } = services;

  fastify.post<{
    Body: {
      extProvider: string;
      extProviderUserId: string;
    };
  }>("/create", async (req, reply) => {
    const { id } = await userService.createUser(req.body, req.user);
    await reply.status(201).send({ id });
  });

  done();
};

export default userController;
