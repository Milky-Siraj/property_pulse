import connectDB from "@/config/database";
import User from "@/models/User";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      timeout: 100000,
    }),
  ],
  debug: true,
  callbacks: {
    async signIn({ profile }) {
      try {
        // 1. connect to db
        await connectDB();

        // 2. check if user exists
        const userExists = await User.findOne({ email: profile.email });

        // 3. if not, add user to db
        if (!userExists) {
          const username = profile.name.slice(0, 20);
          await User.create({
            email: profile.email,
            username,
            image: profile.picture,
          });
        } else {
          console.log("User already exists in the database.");
        }

        // 4. return true to allow sign in
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false; // Return false to prevent sign-in in case of an error
      }
    },

    async session({ session }) {
      //1. Get user from the database
      const user = await User.findOne({ email: session.user.email });
      // 2.Assign the user id to the session
      session.user.id = user._id.toString();
      // 3. return session
      return session;
    },
  },
};
