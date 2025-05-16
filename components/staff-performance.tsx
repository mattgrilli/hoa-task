import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export function StaffPerformance() {
  // Mock data - in a real app, this would come from an API
  const performanceData = [
    {
      id: "1",
      name: "John Smith",
      avatar: "/abstract-geometric-shapes.png",
      initials: "JS",
      tasksCompleted: 42,
      tasksOverdue: 3,
      completionRate: 93,
      responseTime: "1.2 days",
      communities: 2,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      avatar: "/abstract-geometric-shapes.png",
      initials: "SJ",
      tasksCompleted: 38,
      tasksOverdue: 2,
      completionRate: 95,
      responseTime: "0.9 days",
      communities: 2,
    },
    {
      id: "3",
      name: "Emily Davis",
      avatar: "/abstract-geometric-shapes.png",
      initials: "ED",
      tasksCompleted: 25,
      tasksOverdue: 1,
      completionRate: 96,
      responseTime: "1.0 days",
      communities: 2,
    },
    {
      id: "4",
      name: "Michael Brown",
      avatar: "/abstract-geometric-shapes.png",
      initials: "MB",
      tasksCompleted: 31,
      tasksOverdue: 4,
      completionRate: 89,
      responseTime: "1.5 days",
      communities: 1,
    },
    {
      id: "5",
      name: "David Wilson",
      avatar: "/abstract-geometric-shapes.png",
      initials: "DW",
      tasksCompleted: 22,
      tasksOverdue: 2,
      completionRate: 92,
      responseTime: "1.1 days",
      communities: 2,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Performance</CardTitle>
        <CardDescription>Track task completion rates and performance metrics.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="completion">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="completion">Completion</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="response">Response Time</TabsTrigger>
          </TabsList>
          <TabsContent value="completion" className="space-y-4 pt-4">
            {performanceData
              .sort((a, b) => b.completionRate - a.completionRate)
              .map((staff) => (
                <div key={staff.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={staff.avatar || "/placeholder.svg"} alt={staff.name} />
                        <AvatarFallback>{staff.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{staff.name}</span>
                    </div>
                    <span className="text-sm font-medium">{staff.completionRate}%</span>
                  </div>
                  <Progress value={staff.completionRate} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{staff.tasksCompleted} tasks completed</span>
                    <span>{staff.communities} communities</span>
                  </div>
                </div>
              ))}
          </TabsContent>
          <TabsContent value="overdue" className="space-y-4 pt-4">
            {performanceData
              .sort((a, b) => a.tasksOverdue - b.tasksOverdue)
              .map((staff) => (
                <div key={staff.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={staff.avatar || "/placeholder.svg"} alt={staff.name} />
                        <AvatarFallback>{staff.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{staff.name}</span>
                    </div>
                    <span className="text-sm font-medium">{staff.tasksOverdue} overdue</span>
                  </div>
                  <Progress value={100 - (staff.tasksOverdue / staff.tasksCompleted) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{((staff.tasksOverdue / staff.tasksCompleted) * 100).toFixed(1)}% overdue rate</span>
                    <span>{staff.communities} communities</span>
                  </div>
                </div>
              ))}
          </TabsContent>
          <TabsContent value="response" className="space-y-4 pt-4">
            {performanceData
              .sort((a, b) => Number.parseFloat(a.responseTime) - Number.parseFloat(b.responseTime))
              .map((staff) => (
                <div key={staff.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={staff.avatar || "/placeholder.svg"} alt={staff.name} />
                        <AvatarFallback>{staff.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{staff.name}</span>
                    </div>
                    <span className="text-sm font-medium">{staff.responseTime}</span>
                  </div>
                  <Progress value={100 - (Number.parseFloat(staff.responseTime) / 2) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Average response time</span>
                    <span>{staff.communities} communities</span>
                  </div>
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
