import { NextRequest, NextResponse } from "next/server";
import { readCustomTypesYamlFile, readTypesYamlFile } from "@/app/lib/yaml";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customTypeMode = searchParams.get("customTypeMode") === "true";
  try {
    const types = await (customTypeMode
      ? readCustomTypesYamlFile()
      : readTypesYamlFile());
    return NextResponse.json(types);
  } catch (error) {
    console.error("Error reading types:", error);
    return NextResponse.json(
      { error: "Failed to load conference types" },
      { status: 500 }
    );
  }
}
