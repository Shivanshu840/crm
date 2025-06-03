"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Edit, Trash2, X, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSegments, deleteSegment } from "@/lib/api/segments"
import { formatDate } from "@/lib/utils"

export default function SegmentList() {
  const { toast } = useToast()
  const [segments, setSegments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)

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

  const handleDeleteClick = (id: string) => {
    setConfirmingDeleteId(id)
  }

  const handleCancelDelete = () => {
    setConfirmingDeleteId(null)
  }

  const handleConfirmDelete = async (id: string) => {
    const segment = segments.find((s) => s.id === id)

    try {
      setDeletingId(id)
      setConfirmingDeleteId(null)
      await deleteSegment(id)
      setSegments(segments.filter((segment) => segment.id !== id))
      toast({
        title: "Segment deleted",
        description: `"${segment?.name}" has been deleted successfully.`,
      })
    } catch (error: any) {
      console.error("Error deleting segment:", error)

      // Check if the error is due to campaign usage
      const errorMessage = error?.message || ""
      const isCampaignUsageError =
        errorMessage.toLowerCase().includes("campaign") ||
        errorMessage.toLowerCase().includes("in use") ||
        error?.status === 409

      toast({
        title: "Cannot Delete Segment",
        description: isCampaignUsageError
          ? `"${segment?.name}" is currently being used in one or more campaigns and cannot be deleted.`
          : "Failed to delete segment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
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
              {confirmingDeleteId === segment.id ? (
                <div className="flex justify-end gap-2 items-center">
                  <span className="text-sm text-muted-foreground mr-2">Delete "{segment.name}"?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleConfirmDelete(segment.id)}
                    disabled={deletingId === segment.id}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelDelete} disabled={deletingId === segment.id}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(segment.id)}
                    disabled={deletingId === segment.id || confirmingDeleteId !== null}
                  >
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
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
