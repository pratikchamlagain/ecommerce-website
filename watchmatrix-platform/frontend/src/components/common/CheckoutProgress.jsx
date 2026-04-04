export default function CheckoutProgress({ currentStep = 1 }) {
  const steps = [
    { id: 1, label: "Cart" },
    { id: 2, label: "Checkout" },
    { id: 3, label: "Payment" }
  ];

  return (
    <section className="wm-panel mb-5 p-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div className="flex items-center" key={step.id}>
              <div
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold"
                style={{
                  borderColor: isCurrent || isCompleted ? "var(--wm-accent-border)" : "rgb(255 255 255 / 0.2)",
                  backgroundColor: isCurrent || isCompleted ? "var(--wm-accent-soft)" : "rgb(15 23 42 / 0.8)",
                  color: isCurrent || isCompleted ? "var(--wm-accent)" : "rgb(203 213 225)"
                }}
              >
                {step.id}
              </div>
              <span className={isCurrent ? "ml-2 text-sm font-semibold wm-price" : "ml-2 text-sm text-slate-300"}>{step.label}</span>
              {index < steps.length - 1 ? <span className="mx-2 text-slate-500">/</span> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
