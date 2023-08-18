import express, {json} from "express";
import cors from "cors";

import router from "./routes.js";

class App {
    constructor(){
        this.server = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.server.use(json());
        this.server.use(cors());
    }

    routes() {
        this.server.use(router)
    }
}

export default new App().server;