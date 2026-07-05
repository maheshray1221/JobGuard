import type { Metadata } from "next";
import { HistoryPage } from "@/components/history/history-page";

export const metadata: Metadata = {
  title: "Analysis history",
  description: "Review your previously analyzed job listings.",
};

export default function HistoryRoute() {
  return <HistoryPage />;
}
