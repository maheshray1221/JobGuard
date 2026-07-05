import type { Metadata } from "next";
import { HistoryDetailPage } from "@/components/history/history-detail-page";

export const metadata: Metadata = {
  title: "Analysis details",
};

export default async function HistoryDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HistoryDetailPage analysisId={id} />;
}
