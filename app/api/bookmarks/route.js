import connectDB from "@/config/database";
import User from "@/models/User";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

export const POST = async (request) => {
  try {
    await connectDB();

    const { propertyId } = await request.json();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return new Response("userId is required", { status: 401 });
    }

    const { userId } = sessionUser;

    const user = await User.findOne({ _id: userId });

    let isBookedMarked = user.bookmarks.includes(propertyId);

    let message;

    if (isBookedMarked) {
      // already in the book mark remove it
      user.bookmarks.pull(propertyId);
      message = "Bookmark removed successfully";
      isBookedMarked = false;
    } else {
      // if not add it
      user.bookmarks.pull(propertyId);
      message = "BookMark added successfully";
      isBookedMarked = true;
    }

    await user.save();

    return new Response(JSON.stringify({ message, isBookedMarked }), {
      status: 200,
    });
  } catch (error) {}
};
