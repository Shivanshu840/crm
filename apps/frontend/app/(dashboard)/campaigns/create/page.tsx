"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import CampaignForm from "@/components/campaigns/campaign-form"
import { useToast } from "@/hooks/use-toast"
import { getSegmentById } from "@/lib/api/segments"
import { createCampaign, executeCampaign } from "@/lib/api/campaigns"

export default function CreateCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const segmentId = searchParams.get("segmentId")
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [segment, setSegment] = useState<any>(null)
  const [isLoadingSegment, setIsLoadingSegment] = useState(false)

  useEffect(() => {
    const fetchSegment = async () => {
      if (!segmentId) return

      try {
        setIsLoadingSegment(true)
        const segmentData = await getSegmentById(segmentId)
        setSegment(segmentData)
      } catch (error) {
        console.error("Error fetching segment:", error)
        toast({
          title: "Error",
          description: "Failed to load segment details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSegment(false)
      }
    }

    fetchSegment()
  }, [segmentId, toast])

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      setIsLoading(true)

      // Create the campaign
      const campaign = await createCampaign({
        name: campaignData.name,
        segmentId: segmentId!,
        messageTemplate: campaignData.messageTemplate,
      })

      toast({
        title: "Campaign created",
        description: `Campaign "${campaignData.name}" has been created successfully.`,
      })

      // Execute the campaign if requested
      if (campaignData.executeNow) {
        await executeCampaign(campaign.id)

        toast({
          title: "Campaign executed",
          description: "Your campaign is now being sent to the audience.",
        })
      }

      // Redirect to campaign details
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!segmentId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">No Segment Selected</h1>
          <p className="text-muted-foreground mt-2">Please select a segment first to create a campaign.</p>
          <Link href="/segments/create">
            <Button className="mt-4">Create Segment</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/campaigns">
          <Button variant="ghost" className="gap-2 p-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-2">Create Campaign</h1>
        <p className="text-muted-foreground mt-1">Create a campaign for your selected segment</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            {isLoadingSegment ? (
              "Loading segment details..."
            ) : (
              <>
                Create a campaign for segment: <strong>{segment?.name}</strong>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignForm onSubmit={handleCreateCampaign} isLoading={isLoading} segment={segment} />
        </CardContent>
      </Card>
    </div>
  )
}
