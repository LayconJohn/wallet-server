import Transaction from "../models/Transaction.js";
import Cart from "../models/Cart.js";
import * as Yup from "yup";
import { parsePhoneNumber } from "libphonenumber-js";
import { cpf, cnpj } from "cpf-cnpj-validator";
import TransactionService from "../services/transactionsService.js";

class TransactionController {
    async create(req, res){
        try {
            const {
                cardCode,
                paymentType,
                installments,
                customerName,
                customerEmail,
                customerMobile,
                customerDocument,
                billingAddress,
                billingNumber,
                billingNeighborhood,
                billingCity,
                billingState,
                billingZipCode,
                creditCardNumber,
                creditCardExpiration,
                creditCardHolderName,
                creditCardCvv,
            } = req.body;

            const schema = Yup.object({
                cardCode: Yup.string().required(),
                paymentType: Yup.mixed().oneOf(["credit_card", "billet"]).required(),
                installments: Yup.number()
                    .min(1)
                    .when("paymentType", (paymentType, schema) => paymentType === "credit_card" ? schema.max(12) : schema.max(1)),
                costumerName: Yup.string().min(3).required(),
                costumerEmail: Yup.string().email().required(),
                costumerMobile: Yup.string()
                    .required()
                    .test("is-valid-mobile", "${path} is not a mobile number", (value) => parsePhoneNumber(value, "BR").isValid()),
                costumerDocument: Yup.string()
                    .required()
                    .test("is-valid-document", "${path} is not a valid CPF/ CNPJ", (value) => cpf.isValid(value) || cnpj.isValid(value)),
                creditCardNumber: Yup.string().when("paymentType", (paymentType, schema) => {
                    return paymentType == "credit_card" ? schema.required() : schema
                }),
                creditCardExpiration: Yup.string().when("paymentType", (paymentType, schema) => {
                    return paymentType == "credit_card" ? schema.required() : schema
                }),
                creditCardHolderName: Yup.string().when("paymentType", (paymentType, schema) => {
                    return paymentType == "credit_card" ? schema.required() : schema
                }),
                creditCardCvv: Yup.string().when("paymentType", (paymentType, schema) => {
                    return paymentType == "credit_card" ? schema.required() : schema
                }),
            })
            const isValidSchema = await schema.isValid(req.body)
            if (!(isValidSchema)) {
                return res.status(400).json( { error: "Error on validation schema" } )
            }

            const cart = await Cart.findOne({ code: cardCode});
            if (!cart) {
                return res.status(404).json( {error: "Cart not found"} )
            }

            const service = new TransactionService()
            const response = await service.process({
                cardCode,
                paymentType,
                installments,
                customer: {
                    name: customerName,
                    email: customerEmail,
                    mobile: customerMobile,
                    document: customerDocument,
                },
                billing: {
                    address: billingAddress,
                    number: billingNumber,
                    neighborhood: billingNeighborhood,
                    city: billingCity,
                    state: billingState,
                    zipCode: billingZipCode, 
                },
                creditCard: {
                    number: creditCardNumber,
                    expiration: creditCardExpiration,
                    holderName: creditCardHolderName,
                    cvv: creditCardCvv,
                }
            })

            return res.status(201).json(response);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "internal server error" })
        }
    }
}

export default new TransactionController();