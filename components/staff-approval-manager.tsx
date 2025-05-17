"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"

export function StaffApprovalManager() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("staff_approval_requests")
        .select("*, auth:auth_id(email)")
        .order("created_at", { ascending: false })

      if (error) throw error

      setRequests(data || [])
    } catch (error: any) {
      toast({
        title: "Error loading requests",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleApprove = async (requestId: string, role: string) => {
    try {
      setProcessingId(requestId)
      const { data, error } = await supabase.rpc("approve_staff_request", {
        request_id: requestId,
        approved_role: role,
      })

      if (error) throw error

      toast({
        title: "Request Approved",
        description: "The user has been granted staff access.",
      })

      // Reload the requests
      loadRequests()
    } catch (error: any) {
      toast({
        title: "Error approving request",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessingId(requestId)
      const { error } = await supabase
        .from("staff_approval_requests")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", requestId)

      if (error) throw error

      toast({
        title: "Request Rejected",
        description: "The staff access request has been rejected.",
      })

      // Reload the requests
      loadRequests()
    } catch (error: any) {
      toast({
        title: "Error rejecting request",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Access Requests</CardTitle>
        <CardDescription>Approve or reject requests for staff access</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No pending staff access requests</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Requested Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.requested_role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "pending"
                          ? "outline"
                          : request.status === "approved"
                            ? "success"
                            : "destructive"
                      }
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleApprove(request.id, request.requested_role)}
                          disabled={processingId === request.id}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
