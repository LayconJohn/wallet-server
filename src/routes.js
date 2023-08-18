import { Router } from "express";
import CartsController from "./controllers/CartsController.js";

const router = new Router();

router.get("/carts", CartsController.index);

export default router;