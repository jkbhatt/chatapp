import mongoose, { Document, Schema } from "mongoose";

// ============================================================
// TypeScript Interface
// ============================================================
export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId;
  room?: string;
  content: string;
  type: "text" | "image" | "file";
  seen: boolean;
  delivered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Message Schema
// ============================================================
const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User", // references the User model
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    room: {
      type: String,
      required: false,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ room: 1 });
MessageSchema.index({ createdAt: -1 });

const Message = mongoose.model<IMessage>("Message", MessageSchema);
export default Message;