import { NextResponse } from "next/server"
import { createDatabaseFunctions } from "../setup-db/functions"

export async function GET() {
  try {
    const success = await createDatabaseFunctions()

    if (success) {
      return NextResponse.json({ success: true, message: "Database functions created successfully" })
    } else {
      return NextResponse.json({ success: false, message: "Failed to create database functions" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error initializing database functions:", error)
    return NextResponse.json({ success: false, message: error.message || "An error occurred" }, { status: 500 })
  }
}
