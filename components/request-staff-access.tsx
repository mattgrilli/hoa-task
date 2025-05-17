"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function RequestStaffAccess() {
  const [role, setRole] = useState("Community Manager")
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)
  const [pendingRequest, setPendingRequest] = useState<any>(null)
  const { toast } = useToast()

  // Check if user already has a pending request
  const checkPendingRequest = async () => {
    try {
      const { data, error } = await supabase
        .from("staff_approval_requests")
        .select("*")
        .eq("status", "pending")
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setPendingRequest(data)
        setRequested(true)
      }
    } catch (error: any) {
      console.error("Error checking pending request:", error)
    }
  }

  // Call on component mount
  useState(() => {
    checkPendingRequest()
  })

  const handleRequest = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc("request_staff_access", {
        p_role: role,
      })

      if (error) throw error

      setRequested(true)
      setPendingRequest({
        id: data,
        requested_role: role,
        status: "pending",
        created_at: new Date().toISOString(),
      })

      toast({
        title: "Request Submitted",
        description: "Your request for staff access has been submitted and is pending approval.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (requested && pendingRequest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Access Request</CardTitle>
          <CardDescription>Your request is pending approval</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              You have requested access as a <strong>{pendingRequest.requested_role}</strong>. An administrator will
              review your request soon.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-sm text-muted-foreground">
            Requested on: {new Date(pendingRequest.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Staff Access</CardTitle>
        <CardDescription>Apply for staff privileges to manage communities and tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Requested Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Community Manager">Community Manager</SelectItem>
                <SelectItem value="Maintenance Staff">Maintenance Staff</SelectItem>
                <SelectItem value="Administrative Assistant">Administrative Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleRequest} disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </CardFooter>
    </Card>
  )
}
