"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CommunitySelector } from "@/components/community-selector"
import { FileText } from "lucide-react"

export function ReportGenerator() {
  const [reportType, setReportType] = useState("task-status")
  const [dateRange, setDateRange] = useState("last-30-days")
  const [includeDetails, setIncludeDetails] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>Create custom reports for communities and tasks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-type">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger id="report-type">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="task-status">Task Status Report</SelectItem>
              <SelectItem value="community-performance">Community Performance</SelectItem>
              <SelectItem value="staff-productivity">Staff Productivity</SelectItem>
              <SelectItem value="overdue-tasks">Overdue Tasks</SelectItem>
              <SelectItem value="board-summary">Board Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Community</Label>
          <CommunitySelector />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-range">Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger id="date-range">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="year-to-date">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateRange === "custom" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" defaultValue="2025-04-01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" defaultValue="2025-05-16" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Report Options</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-details"
                checked={includeDetails}
                onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
              />
              <Label htmlFor="include-details" className="text-sm font-normal">
                Include detailed task descriptions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-charts"
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
              />
              <Label htmlFor="include-charts" className="text-sm font-normal">
                Include charts and visualizations
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-name">Report Name</Label>
          <Input
            id="report-name"
            placeholder="Enter report name"
            defaultValue={`${
              reportType === "task-status"
                ? "Task Status"
                : reportType === "community-performance"
                  ? "Community Performance"
                  : reportType === "staff-productivity"
                    ? "Staff Productivity"
                    : reportType === "overdue-tasks"
                      ? "Overdue Tasks"
                      : "Board Summary"
            } Report - ${new Date().toLocaleDateString()}`}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Generate PDF Report
        </Button>
      </CardFooter>
    </Card>
  )
}
