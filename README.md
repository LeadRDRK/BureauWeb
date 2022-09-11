# BureauWeb
BureauWeb is a dynamic website generator for OpenBureau servers.

# Installation
Requirements:
- [node.js](https://nodejs.org) v16 or later

You must install it before doing anything described here!

First, download the source code for the latest version of BureauWeb on the [Releases page](https://github.com/LeadRDRK/BureauWeb/releases). After that, run the following command inside the source folder to install the dependencies:
```
npm install
```
When it's done, build the TypeScript code with:
```
npm run build
```

# Usage
First, you need to add the required website templates to the `templates` folder: `index.ejs` and `error.ejs`. The `index.ejs` file is used for the index page while `error.ejs` is used for error pages. If you don't want to write one right now, you can use the ones provided in the `examples` folder.

An OpenBureau server must first be running with an IPC socket opened. The `IPC_SOCKET` property must match between the configuration of the OpenBureau server and BureauWeb. 

To start the server, use the following command:
```
npm run start
```
By default, you should now have a server running on port 8080!

# Config
Configuration is done through environmental variables or a `config.txt` file that has each property separated by a newline (similar to OpenBureau)

Full list of properties:
- `PORT`: The port of the website. Default: 8080
- `IPC_SOCKET`: The path or port to the IPC socket. Could be a UNIX socket, a Windows named pipe or a TCP port. Required.
- `IPC_HOST`: For connecting to external IPC sockets running on TCP.

# Static files
Static files can also be hosted on the server by adding them to the `static` folder. You can also create a folder with an `index.html` file to add static pages.

# License
Licensed under [Apache License 2.0](LICENSE).