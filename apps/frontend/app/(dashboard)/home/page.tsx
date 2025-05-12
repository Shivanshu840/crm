import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BarChart3, Users, Mail } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Intelligent Customer Relationship Management</h1>
        <p className="text-xl text-muted-foreground">
          Create targeted segments, run personalized campaigns, and gain valuable insights with our Mini CRM Platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/segments/create">
            <Button size="lg" className="gap-2">
              Create Segment <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/campaigns">
            <Button size="lg" variant="outline" className="gap-2">
              View Campaigns <BarChart3 className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Customer Segmentation</h3>
          <p className="text-muted-foreground mb-4">
            Create flexible audience segments using powerful rule-based conditions to target the right customers.
          </p>
          <Link href="/segments/create">
            <Button variant="link" className="p-0">
              Create Segment <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Campaign Management</h3>
          <p className="text-muted-foreground mb-4">
            Send personalized messages to your segments and track delivery performance in real-time.
          </p>
          <Link href="/campaigns/create">
            <Button variant="link" className="p-0">
              Create Campaign <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Performance Insights</h3>
          <p className="text-muted-foreground mb-4">
            Gain valuable insights into campaign performance and customer engagement metrics.
          </p>
          <Link href="/dashboard">
            <Button variant="link" className="p-0">
              View Dashboard <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
