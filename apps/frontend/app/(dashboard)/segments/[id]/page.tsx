"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import SegmentBuilder from "@/components/segments/segment-builder"
import { useToast } from "@/hooks/use-toast"
import { getSegmentById, updateSegment } from "@/lib/api/segments"

export default function EditSegmentPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSegment, setIsLoadingSegment] = useState(true)
  const [segmentData, setSegmentData] = useState(null)

  const segmentId = params.id as string

  useEffect(() => {
    const fetchSegment = async () => {
      try {
        setIsLoadingSegment(true)
        const segment = await getSegmentById(segmentId)
        setSegmentData(segment)
      } catch (error) {
        console.error("Error fetching segment:", error)
        toast({
          title: "Error",
          description: "Failed to load segment. Please try again.",
          variant: "destructive",
        })
        router.push("/segments")
      } finally {
        setIsLoadingSegment(false)
      }
    }

    if (segmentId) {
      fetchSegment()
    }
  }, [segmentId, router, toast])

  const handleUpdateSegment = async (updatedSegmentData: any) => {
    try {
      setIsLoading(true)

      // Format the segment data for the API
      const formattedData = {
        name: updatedSegmentData.name,
        description: `${updatedSegmentData.conditionType} - ${updatedSegmentData.subcategory}`,
        rules: {
          conditions: updatedSegmentData.conditions,
          logicType: updatedSegmentData.logicType,
          conditionType: updatedSegmentData.conditionType,
          subcategory: updatedSegmentData.subcategory,
          date: updatedSegmentData.date,
        },
      }

      // Call the API to update the segment
      await updateSegment(segmentId, formattedData)

      toast({
        title: "Segment updated",
        description: `Segment "${updatedSegmentData.name}" has been updated successfully.`,
      })

      // Redirect back to segments list
      router.push("/segments")
    } catch (error) {
      console.error("Error updating segment:", error)
      toast({
        title: "Error",
        description: "Failed to update segment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingSegment) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href="/segments">
            <Button variant="ghost" className="gap-2 p-0">
              <ArrowLeft className="h-4 w-4" />
              Back to Segments
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-2">Edit Segment</h1>
          <p className="text-muted-foreground mt-1">Loading segment data...</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!segmentData) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href="/segments">
            <Button variant="ghost" className="gap-2 p-0">
              <ArrowLeft className="h-4 w-4" />
              Back to Segments
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-2">Edit Segment</h1>
          <p className="text-muted-foreground mt-1">Segment not found</p>
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-bold mt-2">Edit Segment</h1>
        <p className="text-muted-foreground mt-1">Modify your audience targeting rules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segment Builder</CardTitle>
          <CardDescription>Update your segment by modifying the rules to target specific customers</CardDescription>
        </CardHeader>
        <CardContent>
          <SegmentBuilder
            onSave={handleUpdateSegment}
            isLoading={isLoading}
            initialData={segmentData}
            isEditMode={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
