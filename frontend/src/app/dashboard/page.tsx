import type { Metadata } from "next";
import { AnalysisDashboard } from "@/components/dashboard/analysis-dashboard";

export const metadata: Metadata = {
  title: "Analyze a job",
  description:
    "Check a job description or public listing for fraud indicators.",
};

export default function DashboardPage() {
  return <AnalysisDashboard />;
}
