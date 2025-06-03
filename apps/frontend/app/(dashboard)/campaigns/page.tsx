import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import CampaignList from "@/components/campaigns/campaign-list"
import { authOptionUser } from "@/lib/authoption"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";

export default async function CampaignsPage() {
 
const session = await getServerSession(authOptionUser);

  if(!session?.user){
    return redirect("/signin")
  }
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Create and manage your marketing campaigns</p>
        </div>
        <Link href="/segments/create">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>View and manage your marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignList />
        </CardContent>
      </Card>
    </div>
  )
}
