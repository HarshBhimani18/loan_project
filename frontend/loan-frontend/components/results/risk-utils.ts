export type RiskLevel = "Low" | "Medium" | "High";

export function getRiskLevel(probability: number): RiskLevel {
  if (probability < 0.35) return "Low";
  if (probability < 0.65) return "Medium";
  return "High";
}

export function riskBadgeClasses(level: RiskLevel) {
  if (level === "Low") return "bg-[var(--chart-1)] text-[var(--secondary-foreground)]";
  if (level === "Medium") return "bg-[var(--chart-2)] text-[var(--primary-foreground)]";
  return "bg-[var(--chart-4)] text-[var(--primary-foreground)]";
}

export function riskBarClasses(level: RiskLevel) {
  if (level === "Low") return "bg-[var(--chart-1)]";
  if (level === "Medium") return "bg-[var(--chart-2)]";
  return "bg-[var(--chart-4)]";
}

export function riskExplanation(level: RiskLevel) {
  if (level === "Low") {
    return "The borrower profile indicates low estimated default risk based on current model inputs.";
  }
  if (level === "Medium") {
    return "The borrower profile indicates moderate estimated default risk. Consider additional review.";
  }
  return "The borrower profile indicates high estimated default risk. Enhanced due diligence is recommended.";
}
