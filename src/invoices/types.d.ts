export interface Amount {
  amount: Number,
  currency: string,
}

export interface Invoice {
  downloadUrl: string,
  emissionDate: string,
  invoiceHtml: string,
  number: string,
  paymentUrl: string,
  status: InvoiceStatus,
  total: Amount,
  type: InvoiceType,
}

export type InvoiceStatus = "PENDING" | "PROCESSING" | "PAID" | "PAYMENTHELD" | "CANCELED" | "REFUNDED" | "WONTPAY";

export type InvoiceType = "INVOICE" | "CREDITNOTE";

