"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function AddCommunityForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [units, setUnits] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Community name is required")
      return
    }

    if (!units.trim() || isNaN(Number(units))) {
      setError("Units must be a valid number")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const { data, error: insertError } = await supabase
        .from("communities")
        .insert([
          {
            name,
            units: Number(units),
          },
        ])
        .select()

      if (insertError) throw insertError

      toast({
        title: "Community created",
        description: "Your community has been created successfully",
      })

      setName("")
      setUnits("")
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      console.error("Error creating community:", err)
      setError(err.message || "An error occurred while creating the community")

      toast({
        title: "Error creating community",
        description: err.message || "Failed to create community",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Community
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Community</DialogTitle>
          <DialogDescription>Create a new HOA community to manage tasks and staff assignments.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Community Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter community name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="units">Number of Units</Label>
              <Input
                id="units"
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="Enter number of units"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Community"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
