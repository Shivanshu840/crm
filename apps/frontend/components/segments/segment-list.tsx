"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSegments, deleteSegment } from "@/lib/api/segments"
import { formatDate } from "@/lib/utils"

export default function SegmentList() {
  const { toast } = useToast()
  const [segments, setSegments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setIsLoading(true)
        const data = await getSegments()
        setSegments(data)
      } catch (error) {
        console.error("Error fetching segments:", error)
        toast({
          title: "Error",
          description: "Failed to load segments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSegments()
  }, [toast])

  const handleDeleteSegment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this segment?")) {
      return
    }

    try {
      await deleteSegment(id)
      setSegments(segments.filter((segment) => segment.id !== id))
      toast({
        title: "Segment deleted",
        description: "The segment has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting segment:", error)
      toast({
        title: "Error",
        description: "Failed to delete segment. It may be in use by campaigns.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading segments...</div>
  }

  if (segments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No segments found. Create your first segment to get started.</p>
        <Link href="/segments/create">
          <Button>Create Segment</Button>
        </Link>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Audience Size</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {segments.map((segment) => (
          <TableRow key={segment.id}>
            <TableCell className="font-medium">{segment.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{segment.audienceSize} customers</Badge>
            </TableCell>
            <TableCell>{formatDate(segment.createdAt)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleDeleteSegment(segment.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Link href={`/segments/${segment.id}`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/campaigns/create?segmentId=${segment.id}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
