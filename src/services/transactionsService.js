import Cart from "../models/Cart.js";
import Transaction from "../models/Transaction.js";

class TransactionService {
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
            code: 'abc123',
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

        return transaction;
    }
}

export default TransactionService;