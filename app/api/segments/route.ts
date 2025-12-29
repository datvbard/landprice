import { NextResponse } from 'next/server'
import { getSegmentsByStreet, getSegmentById, getSegmentByIdWithLocation } from '@/lib/api/search-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const streetId = searchParams.get('streetId')
  const segmentId = searchParams.get('segmentId')
  const withLocation = searchParams.get('withLocation') === 'true'

  // Get single segment by ID
  if (segmentId) {
    // If withLocation=true, include street and district info
    const segment = withLocation
      ? await getSegmentByIdWithLocation(segmentId)
      : await getSegmentById(segmentId)

    if (!segment) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }
    return NextResponse.json(segment)
  }

  // Get segments by street
  if (!streetId) {
    return NextResponse.json({ error: 'streetId is required' }, { status: 400 })
  }

  const segments = await getSegmentsByStreet(streetId)
  return NextResponse.json(segments)
}
