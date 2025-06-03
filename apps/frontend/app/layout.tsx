import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { getServerSession } from "next-auth"
import { authOptionUser } from "@/lib/authoption"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mini CRM Platform",
  description: "Customer segmentation and campaign management",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptionUser)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
            {children}
        </Providers>
      </body>
    </html>
  )
}
