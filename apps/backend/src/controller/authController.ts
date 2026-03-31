import { Request, Response } from "express";
import { authBodySchema } from "@repo/types/zodSchema";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { httpPusher } from "@repo/redis/queue";
import { db, schema } from "@repo/db/client";
import { eq } from "drizzle-orm";
import "dotenv/config";
import { responseLoopObj } from "../utils/responseLoop.js";

(async () => {
  await httpPusher.connect();
})();

export const emailGenController = async (req: Request, res: Response) => {
  const validInput = authBodySchema.safeParse(req.body);
  if (!validInput.success) {
    res.status(404).json({ message: "Invalid input" });
    return;
  }
  const email = validInput.data.email;
  try {
    const reqId = Date.now().toString() + crypto.randomUUID();

    const [userFound] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email as any, email) as any)
      .limit(1);

    let user = userFound;
    if (!userFound) {
      const [created] = await db
        .insert(schema.users)
        .values({
          email: email,
          balance: 50000000,
          decimal: 4,
        })
        .returning();

      user = created;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "Server configuration error" });
      return;
    }

    const jwtToken = jwt.sign(user!.id, secret);

    await httpPusher.xAdd("stream:app:info", "*", {
      type: "user-signup",
      user: JSON.stringify(user),
      reqId,
    });

    await responseLoopObj.waitForResponse(reqId);

    const { data, error } = await sendEmail(user!.email, jwtToken);
    if (error) {
      res.status(400).json({ message: "Could not send email" });
      return;
    }

    res.json({
      message: "Email sent. Check your inbox and follow the link to log in.",
    });
  } catch (err) {
    res.status(400).json({ message: "Could not sign up, request timed out" });
    return;
  }
};

export const signinController = async (req: Request, res: Response) => {
  const token = req.query.token?.toString();

  if (!token) {
    res.status(411).json({ message: "Token not found" });
    return;
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        message: " Server configuration error",
      });
      return;
    }
    const verifiedToken = jwt.verify(token, secret) as string;

    const reqId = Date.now().toString() + crypto.randomUUID();

    const [userFound] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id as any, verifiedToken) as any)
      .limit(1);

    if (!userFound?.email) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    await httpPusher.xAdd("stream:app:info", "*", {
      type: "user-signin",
      user: JSON.stringify(userFound),
      reqId,
    });

    await responseLoopObj.waitForResponse(reqId);

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });
    res.clearCookie("guest_session", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });
    const corsOrigin = process.env.CORS_ORIGIN;
    res.redirect(new URL("/trade", corsOrigin).toString());
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "name" in err &&
      err.name === "JsonWebTokenError"
    ) {
      res.status(401).json({ message: "Invalid or expired link" });
      return;
    }
    res.status(400).json({ message: "Could not sign in, request timed out" });
  }
};

export const whoamiController = async (req: Request, res: Response) => {
  const userId = (req as unknown as { userId: string }).userId;
  if (userId.startsWith("guest:")) {
    const reqId = Date.now().toString() + crypto.randomUUID();
    try {
      await httpPusher.xAdd("stream:app:info", "*", {
        type: "user-signup",
        user: JSON.stringify({ id: userId, balance: 50000000, decimal: 4 }),
        reqId,
      });
      await responseLoopObj.waitForResponse(reqId);
    } catch {
      // no need to do anything, the user will be created in the database when the first request is made, and the response loop will handle the pending promise
    }
  }

  res.json({
    message: "Authenticated",
    userId,
    isGuest: userId.startsWith("guest:"),
  });
};

export const guestSessionController = async (req: Request, res: Response) => {
  const guestId = `guest:${crypto.randomUUID()}`;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "Server configuration error" });
    return;
  }

  const jwtToken = jwt.sign(guestId, secret);
  const reqId = Date.now().toString() + crypto.randomUUID();

  try {
    await httpPusher.xAdd("stream:app:info", "*", {
      type: "user-signup",
      user: JSON.stringify({ id: guestId, balance: 50000000, decimal: 4 }),
      reqId,
    });
    await responseLoopObj.waitForResponse(reqId);
  } catch (err) {
    res.status(500).json({ message: "Could not create guest session" });
    return;
  }

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("guest_session", jwtToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.json({
    message: "Guest session created",
    userId: guestId,
    isGuest: true,
  });
};

export const logoutController = async (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  });
  res.json({
    message: "Logged out successfully",
  });
};
