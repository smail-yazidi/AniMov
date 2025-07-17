import { type NextRequest, NextResponse } from "next/server"
import { readlistsService } from "@/lib/database/readlists"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    const item = await readlistsService.updateReadlistItem(params.id, updates)

    if (!item) {
      return NextResponse.json({ error: "Readlist item not found" }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error("Update readlist item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await readlistsService.removeFromReadlist(params.id)

    if (!success) {
      return NextResponse.json({ error: "Readlist item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item removed from readlist" })
  } catch (error) {
    console.error("Remove from readlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
