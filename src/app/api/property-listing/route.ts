import { NextResponse } from "next/server";
import { PropertyListing } from "@/data/property-listing";

export function GET() {
  const data: any = PropertyListing;

  return NextResponse.json({ success: true, data });
}
