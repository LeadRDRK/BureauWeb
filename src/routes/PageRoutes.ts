import { FastifyInstance } from "fastify";
import { IpcClient, IpcData } from "../ipc";
import { Utils, ServerType } from "../core";

export function indexPage(fastify: FastifyInstance, ipc: IpcClient, serverType: ServerType) {
    fastify.get("/", async (_, res) => {
        let data: {[key: string]: any} = { serverType };
    
        let ipcRes: IpcData;
        let contentName: string;
        switch (serverType) {
        case "bureau":
            ipcRes = await ipc.sendRequest({type: "getUsers"});
            contentName = "users";
            break;
    
        case "wls":
            ipcRes = await ipc.sendRequest({type: "getBureaus"});
            contentName = "bureaus";
            break;

        }
    
        if (ipcRes.type == "failed")
            return Utils.errorPage(res, 500);
        
        data[contentName] = ipcRes.content;
        return res.type("text/html").code(200)
                  .view("templates/index.ejs", data);
    });
}