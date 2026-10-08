import mongoose from "mongoose";

const WebhookLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    event: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 200,
    },
    durationMs: {
      type: Number,
      default: 140,
    },
    url: {
      type: String,
      default: "",
    },
    delivered: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

WebhookLogSchema.methods.toResponseObject = function () {
  return {
    id: this.logId,
    orderId: this.orderId,
    event: this.event,
    signature: this.signature,
    status: this.status,
    durationMs: this.durationMs,
    url: this.url,
    delivered: this.delivered,
    timestamp: this.createdAt ? this.createdAt.getTime() : Date.now(),
  };
};

export default mongoose.models.WebhookLog || mongoose.model("WebhookLog", WebhookLogSchema);
