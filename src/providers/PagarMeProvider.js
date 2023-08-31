import { cpf } from "cpf-cnpj-validator";
import pagarme from "pagarme";
import "dotenv/config";

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
            card_holder_name: creditCard.holderName,
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
                        document: customer?.document.replace(/[^?0-9]/g, ""),
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
                    street: billing.address,
                    street_number: billing.number,
                    zipcode: billing.zipCode.replace(/[^?0-9]/g, ""),
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
            postback_url: this.process.env.PAGARME_WEBHOOK_URL,
            ...paymentParams,
            ...customerParams,
            ...billingParams,
            ...itemsParams,
            ...metaDataParams,
        }

        const client = await pagarme.client.connect({
            api_key: process.env.PAGARME_API_KEY
        })

        const response = await client.transactions.create(transactionParams);

        return {
            transactionId: response.id,
            status: this.translateStatus(response.status),
            billet: {
                utl: response.boleto_url,
                barCode: response.boleto_barcode,
            },
            card: {
                id: response.card?.id,
            },
            processorResponse: JSON.stringify(response),
        }
    }

    translateStatus(status) {
        const statusMap = { 
            processing: "processing",
            waiting_payment: "pending",
            authorized: "pending",
            paid: "approved",
            refused: "refused",
            pending_refund: "refunded",
            refunded: "refunded",
            chargedback: "chargeback" ,
        }

        return statusMap[status];
    }
}

export default PagarMeProvider;