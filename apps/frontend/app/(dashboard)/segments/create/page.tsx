"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import SegmentBuilder from "@/components/segments/segment-builder"
import { useToast } from "@/hooks/use-toast"
import { createSegment } from "@/lib/api/segments"

export default function CreateSegmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveSegment = async (segmentData: any) => {
    try {
      setIsLoading(true)

      // Format the segment data for the API
      const formattedData = {
        name: segmentData.name,
        description: `${segmentData.conditionType} - ${segmentData.subcategory}`,
        rules: {
          conditions: segmentData.conditions,
          logicType: segmentData.logicType,
          conditionType: segmentData.conditionType,
          subcategory: segmentData.subcategory,
          date: segmentData.date,
        },
      }

      // Call the API to create the segment
      const response = await createSegment(formattedData)

      toast({
        title: "Segment created",
        description: `Segment "${segmentData.name}" has been created successfully.`,
      })

      // Redirect to create campaign with the new segment
      router.push(`/campaigns/create?segmentId=${response.id}`)
    } catch (error) {
      console.error("Error creating segment:", error)
      toast({
        title: "Error",
        description: "Failed to create segment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/segments">
          <Button variant="ghost" className="gap-2 p-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Segments
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-2">Create Segment</h1>
        <p className="text-muted-foreground mt-1">Define your audience with flexible rules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segment Builder</CardTitle>
          <CardDescription>Create a segment by defining rules to target specific customers</CardDescription>
        </CardHeader>
        <CardContent>
          <SegmentBuilder onSave={handleSaveSegment} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
