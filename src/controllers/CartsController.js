class CartsController {
    async index(req, res) {
        return res.status(200).json({status: "ok"})
    }
}

export default new CartsController();