"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MinusCircle, PlusCircle, Users } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { previewAudience } from "@/lib/api/segments"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Condition = {
  id: string
  type: string
  operator: string
  value: string
}

type SegmentBuilderProps = {
  onSave: (segment: {
    name: string
    conditions: Condition[]
    conditionType: string
    subcategory: string
    date?: Date
    logicType: string
  }) => void
  isLoading?: boolean
  initialData?: any
  isEditMode?: boolean
}

export default function SegmentBuilder({
  onSave,
  isLoading = false,
  initialData = null,
  isEditMode = false,
}: SegmentBuilderProps) {
  const [segmentName, setSegmentName] = useState("New Customer Segment")
  const [editingName, setEditingName] = useState(false)
  const [conditionType, setConditionType] = useState("Purchased Product")
  const [subcategory, setSubcategory] = useState("All Categories")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [logicType, setLogicType] = useState("All")
  const [conditions, setConditions] = useState<Condition[]>([
    { id: "1", type: "minimum spent", operator: "is", value: "" },
  ])

  const [audiencePreview, setAudiencePreview] = useState<{ audienceSize: number } | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  // Initialize form with existing data when in edit mode
  useEffect(() => {
    if (initialData && isEditMode) {
      setSegmentName(initialData.name || "New Customer Segment")
      setConditionType(initialData.rules?.conditionType || "Purchased Product")
      setSubcategory(initialData.rules?.subcategory || "All Categories")
      setLogicType(initialData.rules?.logicType || "All")

      if (initialData.rules?.date) {
        setDate(new Date(initialData.rules.date))
      }

      if (initialData.rules?.conditions && initialData.rules.conditions.length > 0) {
        setConditions(initialData.rules.conditions)
      }
    }
  }, [initialData, isEditMode])

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: Math.random().toString(36).substring(7),
        type: "minimum spent",
        operator: "is",
        value: "",
      },
    ])
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((condition) => condition.id !== id))
  }

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    setConditions(conditions.map((condition) => (condition.id === id ? { ...condition, [field]: value } : condition)))
  }

  const handlePreviewAudience = async () => {
    try {
      setIsPreviewLoading(true)

      const rules = {
        conditions,
        logicType,
        conditionType,
        subcategory,
        date,
      }

      const preview = await previewAudience(rules)
      setAudiencePreview(preview)
    } catch (error) {
      console.error("Error previewing audience:", error)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleSave = () => {
    onSave({
      name: segmentName,
      conditions,
      conditionType,
      subcategory,
      date,
      logicType,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xl font-medium flex items-center gap-1">
          Segment Name <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center mt-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            {editingName ? (
              <Input
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                className="max-w-xs"
                autoFocus
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setEditingName(false)
                }}
              />
            ) : (
              <span className="text-lg">{segmentName}</span>
            )}
            <Button variant="link" onClick={() => setEditingName(true)} className="text-primary h-auto p-0">
              Change
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xl font-medium flex items-center gap-1">
          Segment Conditions <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Label>Customers who have</Label>
            <Select value={conditionType} onValueChange={setConditionType}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Purchased Product">Purchased Product</SelectItem>
                <SelectItem value="Visited Website">Visited Website</SelectItem>
                <SelectItem value="Added to Cart">Added to Cart</SelectItem>
                <SelectItem value="Abandoned Cart">Abandoned Cart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Subcategory</Label>
            <Select value={subcategory} onValueChange={setSubcategory}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                <SelectItem value="Jackets">Jackets</SelectItem>
                <SelectItem value="Shirts">Shirts</SelectItem>
                <SelectItem value="Pants">Pants</SelectItem>
                <SelectItem value="Shoes">Shoes</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>When</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full mt-2 justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <span>if</span>
          <Select value={logicType} onValueChange={setLogicType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select logic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Any">Any</SelectItem>
            </SelectContent>
          </Select>
          <span>of these conditions are true</span>
        </div>

        <div className="space-y-4 mt-4">
          {conditions.map((condition) => (
            <div key={condition.id} className="flex flex-wrap md:flex-nowrap items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(condition.id)}
                className="text-destructive"
                disabled={conditions.length === 1}
              >
                <MinusCircle className="h-5 w-5" />
              </Button>
              <Select value={condition.type} onValueChange={(value) => updateCondition(condition.id, "type", value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimum spent">minimum spent</SelectItem>
                  <SelectItem value="total orders">total orders</SelectItem>
                  <SelectItem value="days since last order">days since last order</SelectItem>
                  <SelectItem value="visit count">visit count</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={condition.operator}
                onValueChange={(value) => updateCondition(condition.id, "operator", value)}
              >
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="is">is</SelectItem>
                  <SelectItem value="greater than">greater than</SelectItem>
                  <SelectItem value="less than">less than</SelectItem>
                  <SelectItem value="between">between</SelectItem>
                </SelectContent>
              </Select>
              <span>is</span>
              <Input
                placeholder="Enter amount"
                value={condition.value}
                onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                className="w-full md:w-48"
              />
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addCondition} className="mt-4 flex items-center gap-2 text-primary">
          <PlusCircle className="h-4 w-4" />
          Add condition
        </Button>
      </div>

      {audiencePreview && (
        <Alert>
          <AlertDescription>
            This segment will target <strong>{audiencePreview.audienceSize}</strong> customers.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={handlePreviewAudience} disabled={isPreviewLoading}>
          {isPreviewLoading ? "Calculating..." : "Preview Audience Size"}
        </Button>

        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
          {isLoading ? (isEditMode ? "Updating..." : "Saving...") : isEditMode ? "Update Segment" : "Save Segment"}
        </Button>
      </div>
    </div>
  )
}
