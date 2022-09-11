import { FastifyReply } from "fastify";

function errorPage(res: FastifyReply, code: number) {
    return res.type("text/html").code(404)
              .view("templates/error.ejs", { code });
}

export const Utils = {
    errorPage
}