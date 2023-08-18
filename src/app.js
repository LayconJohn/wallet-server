import express, {json} from "express";
import cors from "cors";

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

    routes() {}
}

export default new App().server;