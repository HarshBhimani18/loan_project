import { RiskDashboard } from "../../components/results/risk-dashboard";

type ResultPageProps = {
  searchParams: Promise<{
    status?: string;
    probability?: string;
    prediction?: string;
    error?: string;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const status = params.status === "error" ? "error" : "success";
  const probability = Number(params.probability ?? 0);
  const prediction = Number(params.prediction ?? 0);
  const error = params.error;

  return (
    <RiskDashboard
      status={status}
      probability={Number.isFinite(probability) ? probability : 0}
      prediction={prediction}
      error={error}
    />
  );
}
