import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ENV_VARS } from "../config/envVars.js";

export const protectRoute = async (req, res, next) => {
  try {
    // 1. Get the token from the cookies
    const token = req.cookies["jwt-netflix"];

    // 2. Check if the token exists; if not, respond with 401 Unauthorized
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - No Token Provided" });
    }

    // 3. Verify the token using the secret key
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);

    // 4. Check if the token was decoded; if not, respond with 401 Unauthorized
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - Invalid Token" });
    }

    // 5. Find the user in the database by ID from the decoded token
    const user = await User.findById(decoded.userId).select("-password"); // Exclude the password from the result

    // 6. Check if the user exists; if not, respond with 404 Not Found
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    // 7. Attach the user to the request object for use in the next middleware or route
    req.user = user;

    // 8. Call next() to move to the next middleware or route handler
    next();
  } catch (error) {
    // Log any errors that occur
    console.log("Error in protectRoute middleware:", error.message);

    // 9. If an error occurs, respond with 500 Internal Server Error if headers haven't been sent
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
};
