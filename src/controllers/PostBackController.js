import Transaction from "../models/Transaction";
import TransactionService from "../services/transactionsService";

class PostBackController {
    async pagarme(req, res) {
        const { id, object, current_status } = req.body;
        try {
            if (object === 'transaction') {
                const transaction = await Transaction.findOne({transactionId: id});
                if (!transaction) {
                    return res.status(404).json();
                }

                const service = new TransactionService();
                await service.updateStatus({ code: transaction.code, providerStatus: current_status });
                return res.status(200).json();
            }
            return res.status(400).json();
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export default new PostBackController();