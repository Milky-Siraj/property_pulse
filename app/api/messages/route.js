import connectDB from "@/config/database";
import Message from "@/models/Message";
import { getSessionUser } from "@/utils/getSessionUser";
import Property from "@/models/Property";

export const dynamic = "force-dynamic";

//GET /api/messages
export const GET = async () => {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.user) {
      return new Response(JSON.stringify("User Id is required"), {
        status: 401,
      });
    }

    const { userId } = sessionUser;

    const messages = await Message.find({ recipient: userId })
      .populate("sender", "username")
      .populate("property", "name");

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify("Something went wrong", { status: 500 })
    );
  }
};

// POST /api/messages

export const POST = async (request) => {
  try {
    await connectDB();

    const { name, email, phone, message, property, recipient } =
      await request.json();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.user) {
      return new Response(
        JSON.stringify({ message: "You must be logged in to send a message" }),
        {
          status: 401,
        }
      );
    }

    const { user } = sessionUser;

    // can not sed message to self
    if (user.id === recipient) {
      return new Response(
        JSON.stringify({ message: "Can not send a message to yourself" }),
        { status: 400 }
      );
    }

    const newMessage = new Message({
      sender: user.id,
      recipient,
      property,
      email,
      name,
      phone,
      body: message,
    });

    await newMessage.save();

    return new Response(JSON.stringify({ message: "Message Sent" }), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return (
      new Response("Something went wrong"),
      {
        status: 500,
      }
    );
  }
};
