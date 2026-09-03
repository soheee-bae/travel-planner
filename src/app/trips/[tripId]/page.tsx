import { TripDetailPlaceholder } from "@/features/trips/components/trip-detail-placeholder";

export default async function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <TripDetailPlaceholder tripId={tripId} />;
}
