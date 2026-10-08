import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    customer: {
      type: String,
      default: "Direct Checkout Client",
    },
    customerRef: {
      type: String,
      default: "",
    },
    customerEmail: {
      type: String,
      default: "",
    },
    amountFiat: {
      type: String,
      required: true,
    },
    fiatCurrency: {
      type: String,
      default: "USD",
    },
    amountCrypto: {
      type: String,
      required: true,
    },
    amountCryptoNum: {
      type: Number,
      required: true,
      index: true,
    },
    asset: {
      type: String,
      default: "BTC",
      index: true,
    },
    protocol: {
      type: String,
      default: "1x Native SegWit",
    },
    depositAddress: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      default: "",
    },
    blockHeight: {
      type: String,
      default: "Pending",
    },
    confirmations: {
      type: Number,
      default: 0,
    },
    requiredConfirmations: {
      type: Number,
      default: 3,
    },
    status: {
      type: String,
      enum: ["Waiting", "Confirming", "Confirmed"],
      default: "Waiting",
      index: true,
    },
    statusBadge: {
      type: String,
      default: "Waiting",
    },
    gasFee: {
      type: String,
      default: "",
    },
    gasBaseFee: {
      type: String,
      default: "22.4 sat/vB",
    },
    network: {
      type: String,
      default: "Bitcoin Mainnet",
    },
    expiresInSeconds: {
      type: Number,
      default: 900,
    },
    webhookEndpoint: {
      type: String,
      default: "",
    },
    webhookStatus: {
      type: String,
      default: "Awaiting Dispatch",
    },
    mempoolSeen: {
      type: Boolean,
      default: false,
    },
    nowpaymentsId: {
      type: String,
      default: null,
      index: true,
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
    payCurrency: {
      type: String,
      default: null,
    },
    purchaseId: {
      type: String,
      default: null,
    },
    actuallyPaid: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.methods.toResponseObject = function () {
  return {
    id: this.orderId,
    mongoId: this._id.toString(),
    userId: this.userId,
    customer: this.customer,
    customerRef: this.customerRef,
    customerEmail: this.customerEmail,
    amountFiat: this.amountFiat,
    fiatCurrency: this.fiatCurrency,
    amountCrypto: this.amountCrypto,
    amountCryptoNum: this.amountCryptoNum,
    asset: this.asset,
    protocol: this.protocol,
    depositAddress: this.depositAddress,
    txHash: this.txHash,
    blockHeight: this.blockHeight,
    confirmations: this.confirmations,
    requiredConfirmations: this.requiredConfirmations,
    status: this.status,
    statusBadge: this.statusBadge,
    gasFee: this.gasFee,
    gasBaseFee: this.gasBaseFee,
    network: this.network,
    expiresInSeconds: this.expiresInSeconds,
    webhookEndpoint: this.webhookEndpoint,
    webhookStatus: this.webhookStatus,
    mempoolSeen: this.mempoolSeen,
    nowpaymentsId: this.nowpaymentsId,
    invoiceUrl: this.invoiceUrl,
    payCurrency: this.payCurrency,
    purchaseId: this.purchaseId,
    actuallyPaid: this.actuallyPaid,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
