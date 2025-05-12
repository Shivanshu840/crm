"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { convertNaturalLanguageToRules } from "@/lib/api/ai"

type NaturalLanguageSegmentProps = {
  onRulesGenerated: (rules: any) => void
}

export default function NaturalLanguageSegment({ onRulesGenerated }: NaturalLanguageSegmentProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a description of the segment you want to create.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const { rules } = await convertNaturalLanguageToRules(query)
      onRulesGenerated(rules)

      toast({
        title: "Rules generated",
        description: "Segment rules have been generated from your description.",
      })
    } catch (error) {
      console.error("Error generating rules:", error)
      toast({
        title: "Error",
        description: "Failed to generate segment rules. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Segment Creator
        </CardTitle>
        <CardDescription>
          Describe your target audience in plain language and we'll create the segment rules for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., People who haven't shopped in 6 months and spent over ₹5K"
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Rules"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
