"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@repo/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card"
import { ArrowLeft, Mail, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCampaignById, executeCampaign } from "@/lib/api/campaigns"
import { Badge } from "@repo/ui/badge"
import { Progress } from "@repo/ui/progress"
import DeliveryLogs from "@/components/campaigns/delivery-logs"

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { toast } = useToast()

  const [campaign, setCampaign] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)

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

    // Poll for updates every 5 seconds if campaign is in progress
    const interval = setInterval(() => {
      if (campaign?.status === "in_progress") {
        fetchCampaign()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [id, toast, campaign?.status])

  const handleExecuteCampaign = async () => {
    try {
      setIsExecuting(true)
      await executeCampaign(id)

      toast({
        title: "Campaign executed",
        description: "Your campaign is now being sent to the audience.",
      })

      // Refresh campaign data
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
          <Badge variant="success" className="gap-1">
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
    </div>
  )
}
