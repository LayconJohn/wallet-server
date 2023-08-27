import { cpf } from "cpf-cnpj-validator";

class PagarMeProvider {
    async process ({
        transactionCode,
        total,
        installments,
        paymentType,
        creditCard,
        customer,
        billing,
        items,
    }) {
        const billetParams = {
            payment_method: "boleto",
            amount: total * 100,
            installments: 1,
        };

        const creditCardParams = {
            payment_method: "credit_card",
            amount: total * 100,
            installments,
            card_number: creditCard.number.replace(/[^?0-9]/g, ""), //Remove tudo que não for número
            card_expiration_date: creditCard.expiration.replace(/[^?0-9]/g, ""),
            card_cvv: creditCard.cvv,
            capture: true, //pré cobrança
        }

        let paymentParams;
        switch (paymentType) {
            case "credit_card":
                paymentParams = creditCardParams;
                break;
            case "billet":
                paymentParams = billetParams;
                break;
            default:
                throw `Payment Type ${paymentType} is not valid`;
        }

        const customerParams = {
            customer: {
                external_id: customer.email,
                name: customer.name,
                email: customer.email,
                type: cpf.isValid(customer.document) ? "indivual" : "corporation",
                country: "br",
                phone_number: [customer.mobile],
                document: [
                    {
                        type: cpf.isValid(customer.document) ? "cpf" : "cnpj",
                        document: customer.document.replace(/[^?0-9]/g, ""),
                    }
                ],
            }
        }

        const billingParams = billing?.zipCode ? {
            billing: {
                name: "Billing Address",
                address: {
                    country: "br",
                    state: billing.state,
                    city: billing.city,
                    neighborhood: billing.neighborhood,
                    street: billing.street,
                    street_number: billing.number,
                    zipcode: billing.zipCode,
                }
            }
        } : {  };

        const itemsParams = items && items.length > 0 ? {
            items: items.map(item => ({
                id: item?.id.toString(),
                title: item?.title,
                unit_price: item?.amount * 100,
                quantity: item?.quantity || 1,
                tangible: false,
            })) 
        } : {
            items: [
                {
                    id: "1",
                    title: `t-${transactionCode}`,
                    unit_price: total * 100,
                    quantity: 1,
                    tangible: false,
                }
            ]
        };

        const metaDataParams = {
            metadata: {
                transaction_code: transactionCode,
            },
        }

        const transactionParams = {
            async: false,
            //postback_url: "",
            ...paymentParams,
            ...customerParams,
            ...billingParams,
            ...itemsParams,
            ...metaDataParams,
        }

        console.debug("transactionParams", transactionParams);
    }
}

export default PagarMeProvider;