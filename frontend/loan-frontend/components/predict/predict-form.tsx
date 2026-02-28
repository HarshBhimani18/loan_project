"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_API_URL = "http://127.0.0.1:8000";

type FormState = {
  Age: string;
  Income: string;
  LoanAmount: string;
  CreditScore: string;
  InterestRate: string;
  LoanTerm: string;
  DTIRatio: string;
  EmploymentType: string;
  Education: string;
  MaritalStatus: string;
  HasMortgage: "Yes" | "No";
  HasDependents: "Yes" | "No";
  LoanPurpose: string;
};

type PredictionResponse = {
  prediction?: number;
  probability?: number;
  error?: string;
};

const initialForm: FormState = {
  Age: "35",
  Income: "65000",
  LoanAmount: "15000",
  CreditScore: "680",
  InterestRate: "11.4",
  LoanTerm: "36",
  DTIRatio: "0.31",
  EmploymentType: "Full-time",
  Education: "Bachelor's",
  MaritalStatus: "Single",
  HasMortgage: "No",
  HasDependents: "No",
  LoanPurpose: "Auto",
};

const selectOptions = {
  EmploymentType: ["Full-time", "Part-time", "Self-employed", "Unemployed"],
  Education: ["High School", "Bachelor's", "Master's", "PhD"],
  MaritalStatus: ["Single", "Married", "Divorced"],
  LoanPurpose: ["Auto", "Business", "Education", "Home", "Other"],
} as const;

const numericFields: Array<keyof FormState> = [
  "Age",
  "Income",
  "LoanAmount",
  "CreditScore",
  "InterestRate",
  "LoanTerm",
  "DTIRatio",
];

const labels: Record<keyof FormState, string> = {
  Age: "Age",
  Income: "Income",
  LoanAmount: "Loan Amount",
  CreditScore: "Credit Score",
  InterestRate: "Interest Rate",
  LoanTerm: "Loan Term",
  DTIRatio: "Debt-to-Income Ratio",
  EmploymentType: "Employment Type",
  Education: "Education",
  MaritalStatus: "Marital Status",
  HasMortgage: "Has Mortgage",
  HasDependents: "Dependents",
  LoanPurpose: "Loan Purpose",
};

function TextField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="space-y-1.5">
      <span className="app-label">{label}</span>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="app-input"
        inputMode="decimal"
        required
      />
    </label>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="space-y-1.5">
      <span className="app-label">{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="app-input">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PredictForm() {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(initialForm);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(values: FormState) {
    if (Number(values.Age) < 18 || Number(values.Age) > 100) return "Age must be between 18 and 100.";
    if (Number(values.CreditScore) < 300 || Number(values.CreditScore) > 900) {
      return "Credit Score must be between 300 and 900.";
    }
    if (Number(values.DTIRatio) < 0 || Number(values.DTIRatio) > 2) {
      return "Debt-to-Income Ratio must be between 0 and 2.";
    }
    for (const field of numericFields) {
      const value = Number(values[field]);
      if (!Number.isFinite(value)) return `Please enter a valid number for ${labels[field]}.`;
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    const apiBaseUrl = (API_URL?.trim() || DEFAULT_API_URL).replace(/\/$/, "");
    const formData: Record<string, number | string> = { ...form, HasCoSigner: "No" };
    for (const key of numericFields) formData[key] = Number(form[key]);

    try {
      const response = await fetch(`${apiBaseUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const raw = await response.text();
      let data: PredictionResponse = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as PredictionResponse;
        } catch {
          throw new Error("Prediction API returned non-JSON response. Check backend URL and server status.");
        }
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || `Prediction request failed (${response.status}).`);
      }
      if (typeof data.probability !== "number") {
        throw new Error("Prediction API response is missing probability.");
      }

      const probability = data.probability;
      const prediction = typeof data.prediction === "number" ? data.prediction : 0;
      const params = new URLSearchParams({
        status: "success",
        probability: String(probability),
        prediction: String(prediction),
      });
      router.push(`/result?${params.toString()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error while predicting.";
      setError(message);
      const params = new URLSearchParams({
        status: "error",
        error: message,
      });
      router.push(`/result?${params.toString()}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="page-title font-semibold text-[var(--foreground)]">Predict Default Risk</h1>
        <p className="body-text mt-2 text-[var(--muted-foreground)]">
          Enter borrower details below and submit to run model inference.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField id="age" label={labels.Age} value={form.Age} onChange={(v) => update("Age", v)} />
            <TextField
              id="income"
              label={labels.Income}
              value={form.Income}
              onChange={(v) => update("Income", v)}
            />
            <TextField
              id="loanAmount"
              label={labels.LoanAmount}
              value={form.LoanAmount}
              onChange={(v) => update("LoanAmount", v)}
            />
            <TextField
              id="creditScore"
              label={labels.CreditScore}
              value={form.CreditScore}
              onChange={(v) => update("CreditScore", v)}
            />
            <TextField
              id="interestRate"
              label={labels.InterestRate}
              value={form.InterestRate}
              onChange={(v) => update("InterestRate", v)}
            />
            <TextField
              id="loanTerm"
              label={labels.LoanTerm}
              value={form.LoanTerm}
              onChange={(v) => update("LoanTerm", v)}
            />
            <TextField
              id="dtiRatio"
              label={labels.DTIRatio}
              value={form.DTIRatio}
              onChange={(v) => update("DTIRatio", v)}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              id="employmentType"
              label={labels.EmploymentType}
              value={form.EmploymentType}
              options={selectOptions.EmploymentType}
              onChange={(v) => update("EmploymentType", v)}
            />
            <SelectField
              id="education"
              label={labels.Education}
              value={form.Education}
              options={selectOptions.Education}
              onChange={(v) => update("Education", v)}
            />
            <SelectField
              id="maritalStatus"
              label={labels.MaritalStatus}
              value={form.MaritalStatus}
              options={selectOptions.MaritalStatus}
              onChange={(v) => update("MaritalStatus", v)}
            />
            <SelectField
              id="loanPurpose"
              label={labels.LoanPurpose}
              value={form.LoanPurpose}
              options={selectOptions.LoanPurpose}
              onChange={(v) => update("LoanPurpose", v)}
            />
            <SelectField
              id="hasMortgage"
              label={labels.HasMortgage}
              value={form.HasMortgage}
              options={["Yes", "No"]}
              onChange={(v) => update("HasMortgage", v as "Yes" | "No")}
            />
            <SelectField
              id="hasDependents"
              label={labels.HasDependents}
              value={form.HasDependents}
              options={["Yes", "No"]}
              onChange={(v) => update("HasDependents", v as "Yes" | "No")}
            />
          </div>
        </section>

        {error && (
          <div className="body-text rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-[var(--foreground)]">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Predicting..." : "Predict Default Risk"}
          </Button>
          <span className="small-label font-code text-[var(--muted-foreground)]">API: POST /predict</span>
        </div>
      </form>
    </Card>
  );
}
