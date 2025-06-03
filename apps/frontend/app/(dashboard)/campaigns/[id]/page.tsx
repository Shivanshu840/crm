"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, CheckCircle, XCircle, Clock, Sparkles, RefreshCw, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCampaignById, executeCampaign } from "@/lib/api/campaigns"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DeliveryLogs from "@/components/campaigns/delivery-logs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface CampaignSummary {
  summary: string
  aiGenerated: boolean
  error?: string
}

export default function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const { toast } = useToast()

  const [campaign, setCampaign] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)
  const [campaignSummary, setCampaignSummary] = useState<CampaignSummary | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true)
        const campaignData = await getCampaignById(id)
        setCampaign(campaignData)
      } catch (error) {
        console.error("Error fetching campaign:", error)
        toast({
          title: "Error",
          description: "Failed to load campaign details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaign()

    const interval = setInterval(() => {
      if (campaign?.status === "in_progress") {
        fetchCampaign()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [id, toast, campaign?.status])

  const fetchCampaignSummary = async () => {
    try {
      setIsSummaryLoading(true)
      const response = await fetch(`/api/ai/campaign/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary")
      }

      setCampaignSummary({
        summary: data.summary,
        aiGenerated: data.aiGenerated,
        error: data.error,
      })

      if (data.aiGenerated) {
        toast({
          title: "AI Summary Generated",
          description: "Campaign summary has been generated successfully.",
        })
      }
    } catch (error) {
      console.error("Error fetching campaign summary:", error)
      toast({
        title: "Error",
        description: "Failed to generate campaign summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSummaryLoading(false)
    }
  }

  const handleExecuteCampaign = async () => {
    try {
      setIsExecuting(true)
      await executeCampaign(id)

      toast({
        title: "Campaign executed",
        description: "Your campaign is now being sent to the audience.",
      })

      const updatedCampaign = await getCampaignById(id)
      setCampaign(updatedCampaign)
    } catch (error) {
      console.error("Error executing campaign:", error)
      toast({
        title: "Error",
        description: "Failed to execute campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleDeleteCampaign = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`http://localhost:5000/api/campaigns/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete campaign")
      }

      toast({
        title: "Campaign deleted",
        description: "The campaign has been successfully deleted.",
      })

      // Redirect to campaigns list
      router.push("/campaigns")
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast({
        title: "Error",
        description: "Failed to delete campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" /> Scheduled
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="secondary" className="gap-1">
            <Mail className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" /> Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Loading campaign details...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Campaign Not Found</h1>
          <p className="text-muted-foreground mt-2">The campaign you're looking for doesn't exist.</p>
          <Link href="/campaigns">
            <Button className="mt-4">View All Campaigns</Button>
          </Link>
        </div>
      </div>
    )
  }

  const deliveryProgress =
    campaign.audienceSize > 0 ? ((campaign.sentCount + campaign.failedCount) / campaign.audienceSize) * 100 : 0

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/campaigns">
          <Button variant="ghost" className="gap-2 p-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
        <div className="flex justify-between items-center mt-2">
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">Segment: {campaign.segment.name}</p>
              {getStatusBadge(campaign.status)}
            </div>
          </div>
          {campaign.status === "scheduled" && (
            <Button onClick={handleExecuteCampaign} disabled={isExecuting}>
              {isExecuting ? "Executing..." : "Execute Campaign"}
            </Button>
          )}
        </div>
      </div>

      {/* AI Campaign Summary Section */}
      <Card className="mb-6 border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Campaign Summary</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCampaignSummary}
              disabled={isSummaryLoading}
              className="gap-2"
            >
              {isSummaryLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {campaignSummary ? "Regenerate" : "Generate"} Summary
                </>
              )}
            </Button>
          </div>
          <CardDescription>Get AI-powered insights about your campaign performance and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          {isSummaryLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Generating AI summary...</p>
              </div>
            </div>
          ) : campaignSummary ? (
            <div className="space-y-3">
              <div className="bg-background p-4 rounded-lg border">
                <p className="text-sm leading-relaxed">{campaignSummary.summary}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {campaignSummary.aiGenerated ? (
                  <>
                    <Sparkles className="h-3 w-3 text-primary" />
                    Generated by AI
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    Fallback summary (AI unavailable)
                  </>
                )}
              </div>
              {campaignSummary.error && (
                <Alert className="mt-2">
                  <AlertDescription className="text-xs">Note: {campaignSummary.error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Generate an AI-powered summary of your campaign performance
              </p>
              <Button onClick={fetchCampaignSummary} variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Summary
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audience Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.audienceSize}</div>
            <p className="text-xs text-muted-foreground">Total recipients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.sentCount}</div>
            <p className="text-xs text-muted-foreground">
              {campaign.audienceSize > 0
                ? `${Math.round((campaign.sentCount / campaign.audienceSize) * 100)}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.failedCount}</div>
            <p className="text-xs text-muted-foreground">
              {campaign.audienceSize > 0
                ? `${Math.round((campaign.failedCount / campaign.audienceSize) * 100)}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Delivery Progress</CardTitle>
          <CardDescription>
            {campaign.status === "completed"
              ? "Campaign delivery completed"
              : campaign.status === "in_progress"
                ? "Campaign is currently being delivered"
                : "Campaign is scheduled for delivery"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={deliveryProgress} />
            <div className="text-xs text-muted-foreground">
              {Math.round(deliveryProgress)}% complete ({campaign.sentCount + campaign.failedCount} of{" "}
              {campaign.audienceSize})
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Campaign Timeline</CardTitle>
          <CardDescription>When this campaign was created, started, and completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-xs text-muted-foreground">
                  {campaign.createdAt ? new Date(campaign.createdAt).toLocaleString() : "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Started</p>
                <p className="text-xs text-muted-foreground">
                  {campaign.startedAt ? new Date(campaign.startedAt).toLocaleString() : "Not started yet"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-xs text-muted-foreground">
                  {campaign.completedAt ? new Date(campaign.completedAt).toLocaleString() : "Not completed yet"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Template</CardTitle>
          <CardDescription>The message template used for this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{campaign.messageTemplate}</div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Delivery Logs</CardTitle>
          <CardDescription>Detailed delivery status for each recipient</CardDescription>
        </CardHeader>
        <CardContent>
          <DeliveryLogs campaignId={id} />
        </CardContent>
      </Card>

      {/* Delete Campaign Section */}
      <Card className="mt-6 border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete this campaign. This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Campaign
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the campaign "{campaign.name}" and remove
                  all associated data including delivery logs and communication history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCampaign}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete Campaign"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
