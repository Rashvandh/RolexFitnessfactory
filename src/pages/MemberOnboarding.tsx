import { useState } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import {
  User, Dumbbell, Heart, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle,
} from "lucide-react";

// ─── Validation schemas per step ───
const personalSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(7, "Phone number is too short").max(20),
  dob: z.string().min(1, "Date of birth is required"),
});

const fitnessSchema = z.object({
  goal: z.string().min(1, "Please select a fitness goal"),
  experience: z.string().min(1, "Please select your experience level"),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  medicalConditions: z.string().max(500).optional(),
});

const planSchema = z.object({
  plan: z.string().min(1, "Please select a plan"),
  addons: z.array(z.string()),
});

type PersonalData = z.infer<typeof personalSchema>;
type FitnessData = z.infer<typeof fitnessSchema>;
type PlanData = z.infer<typeof planSchema>;

const STEPS = [
  { label: "Personal", icon: User },
  { label: "Fitness", icon: Dumbbell },
  { label: "Plan", icon: CreditCard },
  { label: "Confirm", icon: CheckCircle2 },
];

const goals = ["Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "General Fitness"];
const experiences = ["Beginner", "Intermediate", "Advanced", "Professional"];
const times = ["Early Morning (5-7 AM)", "Morning (7-10 AM)", "Afternoon (12-3 PM)", "Evening (5-8 PM)", "Night (8-10 PM)"];
const plans = [
  { id: "basic", name: "Basic", price: "$19/mo", desc: "Gym floor access & locker room" },
  { id: "pro", name: "Pro", price: "$39/mo", desc: "Personal trainer & nutrition plan" },
  { id: "elite", name: "Elite", price: "$69/mo", desc: "24/7 access, spa & priority booking" },
];
const addonOptions = ["Towel Service", "Locker Rental", "Parking Pass", "Nutrition Consultation"];

const MemberOnboarding = () => {
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState<PersonalData>({ firstName: "", lastName: "", email: "", phone: "", dob: "" });
  const [fitness, setFitness] = useState<FitnessData>({ goal: "", experience: "", preferredTime: "", medicalConditions: "" });
  const [planData, setPlanData] = useState<PlanData>({ plan: "", addons: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);

  const validateStep = (): boolean => {
    let result: z.SafeParseReturnType<any, any>;
    if (step === 0) result = personalSchema.safeParse(personal);
    else if (step === 1) result = fitnessSchema.safeParse(fitness);
    else if (step === 2) result = planSchema.safeParse(planData);
    else return true;

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[String(e.path[0])] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step === 3) {
      setComplete(true);
      return;
    }
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  const toggleAddon = (addon: string) =>
    setPlanData((p) => ({
      ...p,
      addons: p.addons.includes(addon) ? p.addons.filter((a) => a !== addon) : [...p.addons, addon],
    }));

  const InputField = ({ label, name, type = "text", value, onChange, placeholder }: any) => (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="dark-input w-full px-4 py-3 rounded-md"
      />
      {errors[name] && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {errors[name]}
        </p>
      )}
    </div>
  );

  const SelectField = ({ label, name, value, onChange, options }: any) => (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="dark-input w-full px-4 py-3 rounded-md">
        <option value="">Select...</option>
        {options.map((o: string) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {errors[name]}
        </p>
      )}
    </div>
  );

  if (complete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="inline-flex p-6 rounded-full bg-primary/10 mb-6 animate-pulse-glow">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-3">WELCOME TO Rolex Fitness Factory!</h1>
          <p className="text-muted-foreground mb-2">Your account has been set up successfully.</p>
          <p className="text-sm text-muted-foreground mb-8">
            {personal.firstName}, you're all set with the <span className="text-primary font-semibold">{planData.plan}</span> plan.
          </p>
          <Link to="/member" className="neon-glow-btn px-8 py-3 rounded-md font-heading text-sm tracking-wider inline-block">
            GO TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(1_95%_46%/0.5)]"
                      : isDone
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-[10px] mt-1 font-heading tracking-wider ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-1 transition-colors duration-300 ${i < step ? "bg-primary/50" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          {/* Step 0: Personal */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-heading text-lg font-bold mb-2">PERSONAL DETAILS</h2>
              <p className="text-sm text-muted-foreground mb-4">Let's start with your basic information.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="First Name" name="firstName" value={personal.firstName} onChange={(v: string) => setPersonal({ ...personal, firstName: v })} placeholder="John" />
                <InputField label="Last Name" name="lastName" value={personal.lastName} onChange={(v: string) => setPersonal({ ...personal, lastName: v })} placeholder="Doe" />
              </div>
              <InputField label="Email" name="email" type="email" value={personal.email} onChange={(v: string) => setPersonal({ ...personal, email: v })} placeholder="john@example.com" />
              <InputField label="Phone" name="phone" type="tel" value={personal.phone} onChange={(v: string) => setPersonal({ ...personal, phone: v })} placeholder="+1 (555) 000-0000" />
              <InputField label="Date of Birth" name="dob" type="date" value={personal.dob} onChange={(v: string) => setPersonal({ ...personal, dob: v })} />
            </div>
          )}

          {/* Step 1: Fitness */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-heading text-lg font-bold mb-2">FITNESS PROFILE</h2>
              <p className="text-sm text-muted-foreground mb-4">Help us customize your experience.</p>
              <SelectField label="Fitness Goal" name="goal" value={fitness.goal} onChange={(v: string) => setFitness({ ...fitness, goal: v })} options={goals} />
              <SelectField label="Experience Level" name="experience" value={fitness.experience} onChange={(v: string) => setFitness({ ...fitness, experience: v })} options={experiences} />
              <SelectField label="Preferred Time" name="preferredTime" value={fitness.preferredTime} onChange={(v: string) => setFitness({ ...fitness, preferredTime: v })} options={times} />
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Medical Conditions (optional)</label>
                <textarea
                  rows={3}
                  value={fitness.medicalConditions}
                  onChange={(e) => setFitness({ ...fitness, medicalConditions: e.target.value })}
                  placeholder="Any injuries, allergies, or conditions we should know about..."
                  className="dark-input w-full px-4 py-3 rounded-md resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Plan */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-heading text-lg font-bold mb-2">CHOOSE YOUR PLAN</h2>
              <p className="text-sm text-muted-foreground mb-4">Select a membership plan and optional add-ons.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanData({ ...planData, plan: p.name })}
                    className={`p-4 rounded-lg text-left transition-all duration-300 ${planData.plan === p.name
                      ? "neon-border bg-card"
                      : "bg-card border border-border hover:border-primary/30"
                      }`}
                  >
                    <p className="font-heading text-sm font-bold">{p.name}</p>
                    <p className="text-primary text-lg font-heading font-bold mt-1">{p.price}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
              {errors.plan && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.plan}
                </p>
              )}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Add-ons</label>
                <div className="grid grid-cols-2 gap-2">
                  {addonOptions.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAddon(a)}
                      className={`p-3 rounded-md text-sm text-left transition-all duration-200 ${planData.addons.includes(a)
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-secondary/50 text-muted-foreground border border-border hover:border-primary/20"
                        }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-heading text-lg font-bold mb-2">CONFIRM DETAILS</h2>
              <p className="text-sm text-muted-foreground mb-4">Review your information before completing registration.</p>
              <div className="space-y-3">
                <div className="p-4 rounded-md bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1 font-heading">PERSONAL</p>
                  <p className="text-sm text-foreground">{personal.firstName} {personal.lastName}</p>
                  <p className="text-xs text-muted-foreground">{personal.email} · {personal.phone}</p>
                </div>
                <div className="p-4 rounded-md bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1 font-heading">FITNESS</p>
                  <p className="text-sm text-foreground">{fitness.goal} · {fitness.experience}</p>
                  <p className="text-xs text-muted-foreground">{fitness.preferredTime}</p>
                </div>
                <div className="p-4 rounded-md bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1 font-heading">PLAN</p>
                  <p className="text-sm text-foreground">{planData.plan}</p>
                  {planData.addons.length > 0 && (
                    <p className="text-xs text-primary mt-1">Add-ons: {planData.addons.join(", ")}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {step > 0 ? (
              <button onClick={prev} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Home</Link>
            )}
            <button onClick={next} className="neon-glow-btn px-6 py-3 rounded-md font-heading text-sm tracking-wider flex items-center gap-2">
              {step === 3 ? "COMPLETE" : "NEXT"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberOnboarding;
