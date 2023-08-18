import Cart from "../models/Cart.js";

class CartsController {
    async index(req, res) {
        try {
            const carts = await Cart.find();
            return res.status(200).json(carts);
        } catch (error) {
            console.log(error);
            return res.status(500).json({error: "Internal server error"})
        }

        
    }
}

export default new CartsController();