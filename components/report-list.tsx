import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, FileText } from "lucide-react"

export function ReportList() {
  // Mock data - in a real app, this would come from an API
  const reports = [
    {
      id: "1",
      name: "Task Status Report - May 2025",
      type: "Task Status",
      community: "All Communities",
      date: "2025-05-15",
      size: "1.2 MB",
    },
    {
      id: "2",
      name: "Oakridge Estates - Board Summary",
      type: "Board Summary",
      community: "Oakridge Estates",
      date: "2025-05-10",
      size: "2.4 MB",
    },
    {
      id: "3",
      name: "Staff Productivity - Q2 2025",
      type: "Staff Productivity",
      community: "All Communities",
      date: "2025-05-01",
      size: "1.8 MB",
    },
    {
      id: "4",
      name: "Overdue Tasks Report - April 2025",
      type: "Overdue Tasks",
      community: "All Communities",
      date: "2025-04-30",
      size: "950 KB",
    },
    {
      id: "5",
      name: "Pinecrest Village - Performance Report",
      type: "Community Performance",
      community: "Pinecrest Village",
      date: "2025-04-15",
      size: "1.5 MB",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
        <CardDescription>View and download previously generated reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-col space-y-2 rounded-md border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(report.date).toLocaleDateString()} • {report.size}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{report.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Community: {report.community}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
