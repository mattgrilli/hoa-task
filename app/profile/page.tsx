"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RequestStaffAccess } from "@/components/request-staff-access"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [userType, setUserType] = useState<"staff" | "resident" | "none">("none")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)

        // Get the current session
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          router.push("/login")
          return
        }

        // Try to get staff profile
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("auth_id", sessionData.session.user.id)
          .single()

        if (staffData) {
          setUser(staffData)
          setName(staffData.name || "")
          setEmail(staffData.email || "")
          setPhone(staffData.phone || "")
          setUserType("staff")
          setLoading(false)
          return
        }

        // If not staff, try to get resident profile
        const { data: residentData, error: residentError } = await supabase
          .from("residents")
          .select("*")
          .eq("auth_id", sessionData.session.user.id)
          .single()

        if (residentData) {
          setUser(residentData)
          setName(residentData.name || "")
          setEmail(residentData.email || "")
          setPhone(residentData.phone || "")
          setUserType("resident")
        } else {
          // User exists in auth but not in staff or residents
          setUser({
            name: sessionData.session.user.user_metadata?.name || "",
            email: sessionData.session.user.email,
          })
          setName(sessionData.session.user.user_metadata?.name || "")
          setEmail(sessionData.session.user.email || "")
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    try {
      setSaving(true)

      // Update the appropriate table based on user type
      if (userType === "staff") {
        const { error } = await supabase
          .from("staff")
          .update({
            name,
            phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (error) throw error
      } else if (userType === "resident") {
        const { error } = await supabase
          .from("residents")
          .update({
            name,
            phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (error) throw error
      }

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { name },
      })

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12">Loading profile...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Profile Details</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar_url || "/abstract-geometric-shapes.png"} alt={name} />
                    <AvatarFallback>
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Change Avatar</Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled />
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                {userType === "staff" && (
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="p-2 border rounded-md bg-muted/50">{user.role}</div>
                  </div>
                )}

                {userType === "resident" && (
                  <div className="space-y-2">
                    <Label>Unit Number</Label>
                    <div className="p-2 border rounded-md bg-muted/50">{user.unit_number || "Not specified"}</div>
                  </div>
                )}

                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" asChild>
                  <a href="/reset-password">Change Password</a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Notification preferences coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-6">
          {userType === "resident" && <RequestStaffAccess />}

          <Card>
            <CardHeader>
              <CardTitle>Account Type</CardTitle>
              <CardDescription>Your current account status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-2 border rounded-md bg-muted/50">
                  {userType === "staff" ? (
                    <span className="font-medium">Staff Member</span>
                  ) : userType === "resident" ? (
                    <span className="font-medium">Resident</span>
                  ) : (
                    <span className="font-medium">Account Setup Incomplete</span>
                  )}
                </div>

                {userType === "none" && (
                  <Alert>
                    <AlertDescription>
                      Your account setup is incomplete. Please contact an administrator for assistance.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
