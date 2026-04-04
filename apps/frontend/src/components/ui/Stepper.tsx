import { Check } from 'lucide-react';

interface Step {
  label: string;
  number: number;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  'data-testid'?: string;
}

export function Stepper({ steps, currentStep, 'data-testid': testId }: StepperProps) {
  return (
    <div data-testid={testId ?? 'stepper'} className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              data-testid={`stepper-step-${step.number}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step.number < currentStep
                  ? 'bg-[var(--stepper-complete)] text-white'
                  : step.number === currentStep
                    ? 'bg-[var(--stepper-complete)] text-white'
                    : 'bg-[var(--stepper-inactive)] text-[var(--text-secondary)]'
              }`}
            >
              {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
            </div>
            <span className="text-xs mt-1 text-[var(--text-secondary)] whitespace-nowrap">
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-0.5 mx-1 transition-colors ${
                step.number < currentStep
                  ? 'bg-[var(--stepper-complete)]'
                  : 'bg-[var(--stepper-inactive)]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
