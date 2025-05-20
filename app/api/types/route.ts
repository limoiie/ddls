import { NextResponse } from "next/server";
import { readTypesYamlFile } from "@/app/lib/yaml";

export async function GET() {
  try {
    const types = await readTypesYamlFile();
    return NextResponse.json(types);
  } catch (error) {
    console.error("Error reading types:", error);
    return NextResponse.json({ error: "Failed to load conference types" }, { status: 500 });
  }
} 