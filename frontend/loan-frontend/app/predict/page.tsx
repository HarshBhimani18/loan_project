import { PredictForm } from "../../components/predict/predict-form";

export default function PredictPage() {
  return (
    <div className="space-y-4">
      <p className="body-text text-[var(--muted-foreground)]">
        Enter borrower information to produce a model-backed credit risk assessment.
      </p>
      <PredictForm />
    </div>
  );
}
