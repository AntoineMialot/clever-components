export interface Amount {
  amount: Number,
  currency: String,
}

export interface Invoice {
  downloadUrl: String,
  emissionDate: String,
  invoiceHtml: String,
  number: String,
  paymentUrl: String,
  status: InvoiceStatus,
  total: Amount,
  type: InvoiceType,
}

export type InvoiceStatus = "PENDING" | "PROCESSING" | "PAID" | "PAYMENTHELD" | "CANCELED" | "REFUNDED" | "WONTPAY";

export type InvoiceType = "INVOICE" | "CREDITNOTE";

