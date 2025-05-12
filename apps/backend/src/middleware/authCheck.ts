import jwt, { JwtPayload } from "jsonwebtoken"
import prisma from "@repo/db/clients"

const secret = process.env.JWT_SECRET || ""
export const protect = async (req:any, res:any, next:any) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }
    if (!token) {
      return res.status(401).json({ error: "Not authorized to access this route" })
    }
    const decoded = jwt.verify(token, secret);
    const userId = (decoded as JwtPayload).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }
    req.user = user
    next()
  } catch (error) {
    console.error("Error protecting route:", error)
    res.status(401).json({ error: "Not authorized to access this route" })
  }
}