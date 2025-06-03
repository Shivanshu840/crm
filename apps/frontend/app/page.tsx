import { getServerSession } from "next-auth";
import styles from "./page.module.css";
import { authOptionUser } from "@/lib/authoption";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptionUser);
  if (!session) {
    return redirect("/signin");
  } 

  return redirect("/home")
}
