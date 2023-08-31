import Cart from "../models/Cart.js";
import Transaction from "../models/Transaction.js";
import { v4 as uuidv4 } from "uuid";
import PagarMeProvider from "../providers/PagarMeProvider.js";

class TransactionService {
    paymentProvider;
    constructor(paymentProvider) {
        this.paymentProvider = paymentProvider || new PagarMeProvider();
    }

    async process({
        cardCode,
        paymentType,
        installments,
        customer,
        billing,
        creditCard
    }) {
        const cart = await Cart.findOne({code: cardCode});
        if (!cart.code) {
            throw `cart ${cardCode} was not found`;
        }
        const transaction = await Transaction.create({
            cardCode: cart.code,
            installments,
            code: await uuidv4(),
            total: cart.price,
            paymentType,
            status: "started",
            customerName: customer.name,
            customerEmail: customer.email,
            customerDocument: customer.document,
            customerMobile: customer.mobile,
            billingAddress: billing.address,
            billingNumber: billing.number,
            billingNeighborhood: billing.neighborhood,
            billingCity: billing.city,
            billingState: billing.state,
            billingZipCode: billing.zipCode
        })


        const response = await this.paymentProvider.process({
            transactionCode: transaction.code,
            total: transaction.total,
            installments,
            paymentType,
            creditCard,
            customer,
            billing,
        });

        await transaction.updateOne({
            transactionId: response.transactionId,
            status: response.status,
            processorReponse: response.processResponse
        })

        return transaction;
    }

    async updateStatus({ code, providerStatus }) {
        const transaction = Transaction.findOne({ code });
        if (!transaction) {
            throw `Transaction ${code} not found`;
        }

        const status = await this.paymentProvider.translateStatus(providerStatus);
        if (!status) {
            throw 'Status is empty';
        }

        await transaction.updateOne({ status });
    }
}

export default TransactionService;