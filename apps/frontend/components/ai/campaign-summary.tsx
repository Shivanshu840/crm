"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, BarChart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCampaignSummary } from "@/lib/api/ai"

type CampaignSummaryProps = {
  campaignId: string
}

export default function CampaignSummary({ campaignId }: CampaignSummaryProps) {
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchSummary = async () => {
    try {
      setIsLoading(true)
      const { summary } = await getCampaignSummary(campaignId)
      setSummary(summary)
    } catch (error) {
      console.error("Error fetching campaign summary:", error)
      toast({
        title: "Error",
        description: "Failed to generate campaign summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (campaignId) {
      fetchSummary()
    }
  }, [campaignId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          AI Campaign Insights
        </CardTitle>
        <CardDescription>AI-generated insights and analysis of your campaign performance.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : summary ? (
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg">{summary}</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No insights available yet.</p>
            <Button onClick={fetchSummary}>Generate Insights</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
