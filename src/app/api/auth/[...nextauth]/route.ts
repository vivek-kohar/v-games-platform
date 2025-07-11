import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// @ts-expect-error NextAuth handler type inference issue
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
