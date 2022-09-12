import { Config, Log, Utils, ServerType } from "./core";
import { IpcClient } from "./ipc";
import Routes from "./routes";
import assert from "node:assert";
import path from "node:path";
import Fastify from "fastify";
import pointOfView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import ejs from "ejs";

const fastify = Fastify();
let ipc: IpcClient;
let serverType: ServerType;

fastify.register(pointOfView, {
    engine: { ejs },
});

fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), "static"),
    prefix: "/"
});

fastify.get("/:name", (req, res) => {
    // @ts-ignore
    res.sendFile(req.params.name);
});

fastify.setErrorHandler((error, _, res) => {
    Utils.errorPage(res, error.statusCode ? error.statusCode : 500);
});

fastify.setNotFoundHandler((_, res) => {
    Utils.errorPage(res, 404);
});

let retryCount = 0;
function tryConnectIpc(portOrPath: string | number, host?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof portOrPath == "number")
            ipc = new IpcClient(portOrPath, host);
        else
            ipc = new IpcClient(portOrPath);

        ipc.socket.on("connect", resolve)
        .on("error", () => {
            if (retryCount == 3) {
                Log.error("Failed to connect to IPC socket after 3 retries, aborting");
                reject();
                return;
            }

            ++retryCount;
            Log.warn(`Failed to connect to IPC socket, retrying in 3 seconds (attempt ${retryCount})`);
            setTimeout(async () => {
                try {
                    await tryConnectIpc(portOrPath, host);
                    resolve();
                }
                catch {
                    reject();
                }
            }, 3000);
        });
    });
}

async function initIpc(): Promise<boolean> {
    const IPC_SOCKET = Config.get("IPC_SOCKET");
    let IPC_HOST = Config.get("IPC_HOST");

    assert(IPC_SOCKET, "A path or port to the IPC socket must be provided");

    try {
        const port = +IPC_SOCKET;
        if (port) {
            if (!IPC_HOST) IPC_HOST = "127.0.0.1";
            await tryConnectIpc(port, IPC_HOST);
        }
        else await tryConnectIpc(IPC_SOCKET);

        const res = await ipc.sendRequest({type: "getServerType"});
        if (res.type == "failed") {
            Log.error("Failed to get server type");
            return false;
        }
        serverType = res.content;
        if (serverType != "bureau" && serverType != "wls") {
            Log.error(`Unknown server type "${serverType}"`);
            return false;
        }
        Log.info(`Connected to IPC socket, server type: ${res.content}`);
    }
    catch (e) {
        return false;
    }

    ipc.socket.on("close", () => {
        Log.error("IPC connection terminated abruptly, aborting");
        process.exit();
    });

    return true;
}

async function main() {
    Config.loadFile("config.txt");

    Log.info(`BureauWeb v${process.env.npm_package_version}`);
    
    const PORT = +Config.get("PORT", "8080");
    assert(Number.isInteger(PORT) && PORT >= 0, "Invalid port provided");
    
    if (!(await initIpc()))
        return;
    
    Routes.indexPage(fastify, ipc, serverType);

    fastify.listen({ port: PORT }, err => {
        if (err) Log.error(err);
        Log.info(`Listening on port ${PORT}`);
    });
}

main();