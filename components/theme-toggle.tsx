"use client"
import { Sun } from "lucide-react"
import { useTheme } from "next-themes"
import React from "react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  // Set theme to light on component mount
  React.useEffect(() => {
    setTheme("light")
  }, [setTheme])

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme("light")}>
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Light theme</span>
    </Button>
  )
}

