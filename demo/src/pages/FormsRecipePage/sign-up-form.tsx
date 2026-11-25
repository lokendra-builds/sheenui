import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Alert,
  Button,
  Checkbox,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  NumberField,
  Select,
} from "@sheenui/theme";

const plans = [
  { value: "free", label: "Free", description: "1 seat" },
  { value: "team", label: "Team", description: "Up to 10 seats" },
  { value: "business", label: "Business", description: "Up to 50 seats" },
];

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.email("Enter a valid email address"),
  plan: z.enum(["free", "team", "business"], { error: "Pick a plan" }),
  seats: z.number({ error: "Enter the number of seats" }).int().min(1, "At least 1 seat").max(50, "At most 50 seats"),
  terms: z.boolean().refine((accepted) => accepted, "Accept the terms to continue"),
});
type SignUp = z.infer<typeof schema>;

/** The live form: zod validates, Field wires the messages, the button shows the async submit, the server error lands on its field. */
export function SignUpForm() {
  const [created, setCreated] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUp>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", plan: undefined, seats: 5, terms: false },
  });

  const onSubmit = async (values: SignUp) => {
    // A real app calls its API here; this one waits, and rejects one address the way a server would.
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (values.email.endsWith("@example.com")) {
      setError("email", { message: "That email is already registered" });
      return;
    }
    setCreated(values.name);
  };

  if (created) {
    return (
      <div className="flex w-full max-w-md flex-col gap-3">
        <Alert tone="success" title={`Welcome, ${created}`}>
          Your account is ready.
        </Alert>
        <Button
          variant="glass"
          size="sm"
          className="self-start"
          onClick={() => {
            reset();
            setCreated(null);
          }}
        >
          Start again
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="flex w-full max-w-md flex-col gap-4"
    >
      <Field required invalid={Boolean(errors.name)}>
        <FieldLabel>Name</FieldLabel>
        <FieldControl>
          <Input {...register("name")} autoComplete="name" />
        </FieldControl>
        <FieldError>{errors.name?.message}</FieldError>
      </Field>

      <Field required invalid={Boolean(errors.email)}>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <Input {...register("email")} type="email" autoComplete="email" />
        </FieldControl>
        <FieldDescription>Try anything@example.com to see a server error.</FieldDescription>
        <FieldError>{errors.email?.message}</FieldError>
      </Field>

      <Controller
        control={control}
        name="plan"
        render={({ field, fieldState }) => (
          <Field required invalid={fieldState.invalid}>
            <FieldLabel>Plan</FieldLabel>
            <FieldControl>
              <Select
                items={plans}
                placeholder="Choose a plan"
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                name={field.name}
              />
            </FieldControl>
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="seats"
        render={({ field, fieldState }) => (
          <Field required invalid={fieldState.invalid}>
            <FieldLabel>Seats</FieldLabel>
            <FieldControl>
              <NumberField
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                name={field.name}
                min={1}
                max={50}
              />
            </FieldControl>
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="terms"
        render={({ field, fieldState }) => (
          <Checkbox
            label="I accept the terms of service"
            checked={field.value}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            name={field.name}
            error={fieldState.error?.message}
          />
        )}
      />

      <Button type="submit" loading={isSubmitting} className="self-start">
        Create account
      </Button>
    </form>
  );
}
