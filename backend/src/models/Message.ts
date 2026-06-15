import mongoose, { Document, Schema } from "mongoose";

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

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ room: 1 });
MessageSchema.index({ createdAt: -1 });

const Message = mongoose.model<IMessage>("Message", MessageSchema);

export default Message;