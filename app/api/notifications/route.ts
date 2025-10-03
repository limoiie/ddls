import { deleteNotification, setNotification } from "@/app/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { confEditionId, notification } = body;

    if (!confEditionId) {
      return NextResponse.json(
        { error: "confEditionId is required" },
        { status: 400 }
      );
    }

    if (notification === null || notification === undefined) {
      // Delete the notification time if it's null/undefined
      deleteNotification(confEditionId);
    } else {
      // Set the notification time
      setNotification(confEditionId, notification);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification time:", error);
    return NextResponse.json(
      { error: "Failed to update notification time" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confEditionId = searchParams.get("confEditionId");

    if (!confEditionId) {
      return NextResponse.json(
        { error: "confEditionId is required" },
        { status: 400 }
      );
    }

    deleteNotification(confEditionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification time:", error);
    return NextResponse.json(
      { error: "Failed to delete notification time" },
      { status: 500 }
    );
  }
}
