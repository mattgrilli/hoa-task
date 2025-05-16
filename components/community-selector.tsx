"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getCommunities } from "@/app/actions/communities"

export function CommunitySelector() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("all")
  const [communities, setCommunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCommunities() {
      try {
        const communitiesData = await getCommunities()
        setCommunities(communitiesData || [])
        setLoading(false)
      } catch (error) {
        console.error("Error loading communities:", error)
        setLoading(false)
      }
    }

    loadCommunities()
  }, [])

  const allCommunities = [{ id: "all", name: "All Communities" }, ...(communities || [])]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {loading
            ? "Loading..."
            : value
              ? allCommunities.find((community) => community.id === value)?.name
              : "Select community..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search community..." />
          <CommandList>
            <CommandEmpty>No community found.</CommandEmpty>
            <CommandGroup>
              {allCommunities.map((community) => (
                <CommandItem
                  key={community.id}
                  value={community.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === community.id ? "opacity-100" : "opacity-0")} />
                  {community.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
