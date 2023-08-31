import { Router } from "express";
import CartsController from "./controllers/CartsController.js";
import TransactionsController from "./controllers/TransactionsController.js";
import PostBackController from "./controllers/PostBackController.js";

const router = new Router();

//CartsRoute
router.get("/carts", CartsController.index);
router.post("/carts", CartsController.create);
router.put("/carts/:id", CartsController.update);
router.delete("/carts/:id", CartsController.destroy);

//TransactionRoute
router.post("/transactions", TransactionsController.create);

//PostBackRoute
router.post("/postbacks/pagarme", PostBackController.pagarme);

export default router;