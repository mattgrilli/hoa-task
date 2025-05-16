"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export function SystemSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "HOA Task Manager",
    supportEmail: "support@hoataskmanager.com",
    maxFileSize: "10",
    defaultTaskDueDays: "7",
  })

  const [securitySettings, setSecuritySettings] = useState({
    requireMfa: false,
    passwordExpiration: "90",
    sessionTimeout: "60",
    allowPublicRegistration: false,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enableInAppNotifications: true,
    dailyDigestTime: "08:00",
    notifyOnTaskAssignment: true,
    notifyOnTaskUpdate: true,
    notifyOnTaskCompletion: true,
    notifyOnDueDateApproaching: true,
  })

  const { toast } = useToast()

  const handleSaveGeneral = () => {
    toast({
      title: "Settings saved",
      description: "General settings have been updated successfully",
    })
  }

  const handleSaveSecurity = () => {
    toast({
      title: "Settings saved",
      description: "Security settings have been updated successfully",
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Settings saved",
      description: "Notification settings have been updated successfully",
    })
  }

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure basic system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Maximum File Upload Size (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  value={generalSettings.maxFileSize}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, maxFileSize: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-due-days">Default Task Due Days</Label>
                <Input
                  id="default-due-days"
                  type="number"
                  value={generalSettings.defaultTaskDueDays}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, defaultTaskDueDays: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveGeneral}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-mfa">Require Multi-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require all users to set up MFA</p>
                </div>
                <Switch
                  id="require-mfa"
                  checked={securitySettings.requireMfa}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireMfa: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-registration">Allow Public Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow users to register without an invitation</p>
                </div>
                <Switch
                  id="allow-registration"
                  checked={securitySettings.allowPublicRegistration}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, allowPublicRegistration: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-expiration">Password Expiration (days)</Label>
                <Input
                  id="password-expiration"
                  type="number"
                  value={securitySettings.passwordExpiration}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveSecurity}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure system-wide notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable email notifications</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.enableEmailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, enableEmailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable in-app notifications</p>
                </div>
                <Switch
                  id="in-app-notifications"
                  checked={notificationSettings.enableInAppNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, enableInAppNotifications: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="digest-time">Daily Digest Time</Label>
                <Input
                  id="digest-time"
                  type="time"
                  value={notificationSettings.dailyDigestTime}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, dailyDigestTime: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="task-assignment">Notify on Task Assignment</Label>
                <Switch
                  id="task-assignment"
                  checked={notificationSettings.notifyOnTaskAssignment}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, notifyOnTaskAssignment: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="task-update">Notify on Task Update</Label>
                <Switch
                  id="task-update"
                  checked={notificationSettings.notifyOnTaskUpdate}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, notifyOnTaskUpdate: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="task-completion">Notify on Task Completion</Label>
                <Switch
                  id="task-completion"
                  checked={notificationSettings.notifyOnTaskCompletion}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, notifyOnTaskCompletion: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="due-date">Notify on Due Date Approaching</Label>
                <Switch
                  id="due-date"
                  checked={notificationSettings.notifyOnDueDateApproaching}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, notifyOnDueDateApproaching: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveNotifications}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
