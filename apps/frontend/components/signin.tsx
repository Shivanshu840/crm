"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push("/home")
      }
    }
    checkSession()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn("google", {
        callbackUrl: "/home",
        redirect: true,
      })
    } catch (error) {
      console.error("Sign in error:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900/40">
      <Card className="w-[350px] bg-slate-950/80 border border-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">CRM</CardTitle>
          <CardDescription className="text-slate-400">Sign in to your account using Google</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center disabled:opacity-50"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
