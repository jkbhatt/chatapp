export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const myId = (req as any).userId as string;
    const userId = req.params.userId as string;

    const { content, type = "text" } = req.body;

    if (!content) {
      res.status(400).json({
        status: "error",
        message: "Message content cannot be empty",
      });
      return;
    }

    if (type === "text") {
      const text = String(content).trim();

      if (text.length === 0) {
        res.status(400).json({
          status: "error",
          message: "Message content cannot be empty",
        });
        return;
      }

      if (text.length > 2000) {
        res.status(400).json({
          status: "error",
          message: "Text message cannot exceed 2000 characters",
        });
        return;
      }
    }

    const newMessage = new Message({
      sender: new mongoose.Types.ObjectId(myId),
      receiver: new mongoose.Types.ObjectId(userId),
      content,
      type,
      delivered: true,
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "username avatar isOnline")
      .populate("receiver", "username avatar isOnline");

    res.status(201).json({
      status: "success",
      message: populatedMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to send message",
    });
  }
};