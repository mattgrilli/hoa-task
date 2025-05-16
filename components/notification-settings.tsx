"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export function NotificationSettings() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState({
    taskAssignments: true,
    taskUpdates: true,
    statusChanges: true,
    dueDateReminders: true,
    communityUpdates: false,
    dailyDigest: false,
  })
  const { toast } = useToast()

  const handleSave = () => {
    // In a real app, this would save to the database
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notification settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>Configure which notifications you want to receive via email.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="task-assignments" className="flex flex-col space-y-1">
              <span>Task Assignments</span>
              <span className="font-normal text-xs text-muted-foreground">
                Receive notifications when tasks are assigned to you
              </span>
            </Label>
            <Switch
              id="task-assignments"
              checked={settings.taskAssignments}
              onCheckedChange={(checked) => setSettings({ ...settings, taskAssignments: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="task-updates" className="flex flex-col space-y-1">
              <span>Task Updates</span>
              <span className="font-normal text-xs text-muted-foreground">
                Receive notifications when there are updates to your tasks
              </span>
            </Label>
            <Switch
              id="task-updates"
              checked={settings.taskUpdates}
              onCheckedChange={(checked) => setSettings({ ...settings, taskUpdates: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="status-changes" className="flex flex-col space-y-1">
              <span>Status Changes</span>
              <span className="font-normal text-xs text-muted-foreground">
                Receive notifications when task statuses change
              </span>
            </Label>
            <Switch
              id="status-changes"
              checked={settings.statusChanges}
              onCheckedChange={(checked) => setSettings({ ...settings, statusChanges: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="due-date-reminders" className="flex flex-col space-y-1">
              <span>Due Date Reminders</span>
              <span className="font-normal text-xs text-muted-foreground">Receive reminders before tasks are due</span>
            </Label>
            <Switch
              id="due-date-reminders"
              checked={settings.dueDateReminders}
              onCheckedChange={(checked) => setSettings({ ...settings, dueDateReminders: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="community-updates" className="flex flex-col space-y-1">
              <span>Community Updates</span>
              <span className="font-normal text-xs text-muted-foreground">
                Receive notifications about community changes
              </span>
            </Label>
            <Switch
              id="community-updates"
              checked={settings.communityUpdates}
              onCheckedChange={(checked) => setSettings({ ...settings, communityUpdates: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-digest" className="flex flex-col space-y-1">
              <span>Daily Digest</span>
              <span className="font-normal text-xs text-muted-foreground">Receive a daily summary of all activity</span>
            </Label>
            <Switch
              id="daily-digest"
              checked={settings.dailyDigest}
              onCheckedChange={(checked) => setSettings({ ...settings, dailyDigest: checked })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
