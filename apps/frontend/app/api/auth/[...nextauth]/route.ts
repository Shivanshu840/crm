import Nextauth from "next-auth";
import { authOptionUser } from "@/lib/authoption";

const handler = Nextauth(authOptionUser);

export { handler as GET, handler as POST };
