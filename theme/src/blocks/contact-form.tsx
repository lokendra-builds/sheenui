"use client";

import { useEffect, useId, useRef, useState, type ComponentProps, type SubmitEvent, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "../lib/cn";
import { duration, ease, scaleTo, spring } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { HEADING_TAGS, type HeadingLevelOption } from "../lib/heading";
import { Button } from "../components/button/button";
import { GlassCard } from "../components/glass-card/glass-card";
import { Input } from "../components/input/input";
import { Textarea } from "../components/textarea/textarea";
import { AlertIcon, CheckIcon, MailIcon } from "./icons";

/** The three fields of `ContactForm`. */
export type ContactField = "name" | "email" | "message";

/** What `ContactForm` hands to `onSubmit`: the trimmed values of the three fields. */
export type ContactFormValues = Record<ContactField, string>;

/** Where the form is: `"idle"`, `"submitting"` (the button is loading), `"success"` (the seal is shown) or `"error"`. */
export type ContactFormStatus = "idle" | "submitting" | "success" | "error";

/** Every string `ContactForm` renders or announces, so the block can be translated. */
export type ContactFormLabels = {
  /** Label of the name field. */
  name: string;
  /** Placeholder of the name field. */
  namePlaceholder: string;
  /** Label of the email field. */
  email: string;
  /** Placeholder of the email field. */
  emailPlaceholder: string;
  /** Label of the message field. */
  message: string;
  /** Placeholder of the message field. */
  messagePlaceholder: string;
  /** Text of the submit button. */
  submit: string;
  /** Message under an empty name. */
  nameRequired: string;
  /** Message under an invalid email. */
  invalidEmail: string;
  /** Message under a message that is too short; receives the minimum length. */
  shortMessage: (min: number) => string;
  /** Shown when `onSubmit` throws an error without a message. */
  genericError: string;
  /** Heading of the success view. */
  successTitle: string;
  /** Text under the success heading. */
  successText: string;
  /** Button of the success view that returns to an empty form. */
  another: string;
};

/** The English {@link ContactFormLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultContactFormLabels: ContactFormLabels = {
  name: "Name",
  namePlaceholder: "Your name",
  email: "Email",
  emailPlaceholder: "you@example.com",
  message: "Message",
  messagePlaceholder: "How can we help?",
  submit: "Send message",
  nameRequired: "Enter your name.",
  invalidEmail: "Enter a valid email address.",
  shortMessage: (min) => `Write at least ${min} characters.`,
  genericError: "Something went wrong. Try again.",
  successTitle: "Message sent",
  successText: "Thanks for writing. We usually reply within one working day.",
  another: "Send another message",
};

/** Props of `ContactForm`. */
export type ContactFormProps = {
  /**
   * Called with the trimmed values once they pass validation (`(values: ContactFormValues) => void | Promise<void>`).
   * Return a promise to show the loading state; throw to show an error under the form.
   */
  onSubmit?: (values: ContactFormValues) => void | Promise<void>;
  /**
   * Run the block's own checks on submit (`boolean`). Pass `false` when a form library validates for you, and feed its
   * messages back through `errors`.
   * @default true
   */
  validate?: boolean;
  /** Error messages from outside (`Partial<Record<ContactField | "form", string>>`), for example from react-hook-form's `formState.errors`. They win over the block's own. */
  errors?: Partial<Record<ContactField | "form", string>>;
  /** Extra props for each control (`Partial<Record<ContactField, ComponentProps<"input"> | ComponentProps<"textarea">>>`), so `{...register("email")}` from react-hook-form can be handed over. */
  fieldProps?: Partial<Record<ContactField, ComponentProps<"input"> & ComponentProps<"textarea">>>;
  /** Controls the status (`ContactFormStatus`), for when a form library or your own state knows it. Leave it out to let the block track it. */
  status?: ContactFormStatus;
  /** The values the fields start with (`Partial<ContactFormValues>`). */
  defaultValues?: Partial<ContactFormValues>;
  /**
   * The shortest message accepted by the block's own check (`number`).
   * @default 10
   */
  minMessageLength?: number;
  /**
   * The longest message (`number`); a character counter is shown.
   * @default 1000
   */
  maxMessageLength?: number;
  /** Called when the success view's button returns to an empty form (`() => void`), e.g. to reset your form library. */
  onReset?: () => void;
  /** Shows a small label above the title (`ReactNode`). */
  eyebrow?: ReactNode;
  /** Sets the heading (`ReactNode`). */
  title?: ReactNode;
  /** Sets the line under the heading (`ReactNode`). */
  description?: ReactNode;
  /** Contact details or a map beside the form on a wide block (`ReactNode`). */
  aside?: ReactNode;
  /**
   * Level of the heading (`1` to `6`); `"none"` renders plain text, no heading.
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** Overrides for the block's strings (`Partial<ContactFormLabels>`). */
  labels?: Partial<ContactFormLabels>;
  /** Adds extra classes to the outer element (`string`). */
  className?: string;
};

const EMAIL = /^\S+@\S+\.\S+$/;
const FIELDS: ContactField[] = ["name", "email", "message"];

function SuccessSeal({ reduced }: { reduced: boolean }) {
  return (
    <span aria-hidden className="relative flex size-20 items-center justify-center">
      <motion.span
        className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,var(--sheen-success-glow),transparent)]"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced ? { duration: duration.fast } : { ...spring.bouncy }}
      />
      <motion.span
        data-slot="contact-seal"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: scaleTo.popFrom }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced ? { duration: duration.fast } : { ...spring.bouncy, delay: duration.instant }}
        className="glass-2 relative flex size-14 items-center justify-center rounded-full text-sheen-success-text shadow-[0_0_0_1px_var(--sheen-success-border),0_0_28px_-4px_var(--sheen-success-glow)]"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: duration.slower, ease: ease.out, delay: duration.base }}
          />
        </svg>
      </motion.span>
    </span>
  );
}

/**
 * A contact form on glass: name, email and a message with inline validation, a loading button and a success seal that
 * lights green. Use it on a contact or support page. It works on its own with `onSubmit(values)`, or beside
 * react-hook-form: pass `validate={false}`, `fieldProps` from `register`, the form's `errors` and its `status`.
 *
 * Props (see `ContactFormProps`): `onSubmit(values)`, `validate` (`true`), `errors`, `fieldProps`, `status`,
 * `defaultValues`, `minMessageLength` (`10`), `maxMessageLength` (`1000`), `onReset`, `eyebrow`, `title`,
 * `description`, `aside`, `headingLevel` (`2`), `labels` (`Partial<ContactFormLabels>`), `className`.
 *
 * Keyboard: Tab walks name, email, message and the send button; Enter in a single-line field submits. A failed check
 * moves focus to the first invalid field. On success focus moves to the success heading, and Tab then reaches
 * "Send another message".
 * Accessibility: a real `<form>` with `noValidate`, visible labels, error text linked with `aria-describedby`; the
 * success view is a live `status` region; targets are 44 px on touch devices; the outcome is always text, never light alone.
 * Glass and motion: one level-3 glass card; the form and the success view share one grid cell, so the card never changes
 * height. The button glows while sending (state light) and the seal's check is drawn once with a soft bounce. Reduced
 * motion: the seal fades in, the check appears at once; reduced transparency makes the card opaque.
 *
 * @example
 * ```tsx
 * import { ContactForm } from "@sheenui/theme";
 *
 * // `sendMessage` is your own function; throw from it to show the error under the form.
 * declare function sendMessage(values: { name: string; email: string; message: string }): Promise<void>;
 *
 * export function Example() {
 *   return (
 *     <ContactForm
 *       title="Talk to us"
 *       description="We reply within one working day."
 *       onSubmit={async (values) => {
 *         await sendMessage(values);
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/contact-form
 */
export function ContactForm({
  onSubmit,
  validate = true,
  errors: outsideErrors,
  fieldProps,
  status: statusProp,
  defaultValues,
  minMessageLength = 10,
  maxMessageLength = 1000,
  onReset,
  eyebrow,
  title,
  description,
  aside,
  headingLevel = 2,
  labels,
  className,
}: ContactFormProps) {
  const L = { ...defaultContactFormLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const Heading = HEADING_TAGS[headingLevel];
  const headingId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const [innerStatus, setInnerStatus] = useState<ContactFormStatus>("idle");
  const [inner, setInner] = useState<Partial<Record<ContactField | "form", string>>>({});
  const [formKey, setFormKey] = useState(0);
  const [lengths, setLengths] = useState(defaultValues?.message?.length ?? 0);
  const status = statusProp ?? innerStatus;
  const errors = { ...inner, ...outsideErrors };
  const done = status === "success";
  const focusAfter = useRef<ContactField | null>(null);

  // A moved focus waits one frame so the message is already linked when the field is announced.
  useEffect(() => {
    const field = focusAfter.current;
    if (!field) return;
    focusAfter.current = null;
    const frame = requestAnimationFrame(() => {
      (formRef.current?.elements.namedItem(field) as HTMLElement | null)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [inner]);

  // Success moves focus to the heading of the success view (the form is inert by then).
  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  function check(field: ContactField, value: string): string | undefined {
    const text = value.trim();
    if (field === "name") return text ? undefined : L.nameRequired;
    if (field === "email") return EMAIL.test(text) ? undefined : L.invalidEmail;
    return text.length >= minMessageLength ? undefined : L.shortMessage(minMessageLength);
  }

  function read(): ContactFormValues {
    const data = new FormData(formRef.current ?? undefined);
    const get = (field: ContactField) => (data.get(field) as string | null)?.trim() ?? "";
    return { name: get("name"), email: get("email"), message: get("message") };
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const values = read();
    if (validate) {
      const next: typeof inner = {};
      for (const field of FIELDS) next[field] = check(field, values[field]);
      const first = FIELDS.find((field) => next[field]);
      setInner(next);
      if (first) {
        focusAfter.current = first;
        return;
      }
    } else {
      setInner({});
    }
    setInnerStatus("submitting");
    try {
      await onSubmit?.(values);
      setInnerStatus("success");
    } catch (error) {
      setInner({ form: error instanceof Error && error.message ? error.message : L.genericError });
      setInnerStatus("error");
    }
  }

  function again() {
    setInner({});
    setInnerStatus("idle");
    setLengths(0);
    setFormKey((key) => key + 1);
    onReset?.();
  }

  // Re-check one field as it is edited, but only once it shows an error (no scolding while typing a first value).
  function live(field: ContactField, value: string) {
    if (validate && inner[field]) setInner((prev) => ({ ...prev, [field]: check(field, value) }));
  }

  const controlProps = (field: ContactField) => {
    const extra = fieldProps?.[field];
    return {
      ...extra,
      name: extra?.name ?? field,
      defaultValue: defaultValues?.[field],
      onChange: (event: { target: { value: string } }) => {
        extra?.onChange?.(event as never);
        live(field, event.target.value);
        if (field === "message") setLengths(event.target.value.length);
      },
      onBlur: (event: { target: { value: string } }) => {
        extra?.onBlur?.(event as never);
        if (validate && event.target.value)
          setInner((prev) => ({ ...prev, [field]: check(field, event.target.value) }));
      },
    };
  };

  const form = (
    <form
      key={formKey}
      ref={formRef}
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
      inert={done}
      className={cn("flex flex-col gap-5 [grid-area:1/1]", done && "invisible")}
    >
      <Input
        label={L.name}
        placeholder={L.namePlaceholder}
        autoComplete="name"
        aria-required
        error={errors.name}
        {...(controlProps("name") as ComponentProps<typeof Input>)}
      />
      <Input
        label={L.email}
        type="email"
        placeholder={L.emailPlaceholder}
        autoCapitalize="none"
        spellCheck={false}
        aria-required
        leading={<MailIcon />}
        error={errors.email}
        {...(controlProps("email") as ComponentProps<typeof Input>)}
      />
      <Textarea
        label={L.message}
        placeholder={L.messagePlaceholder}
        minRows={4}
        maxRows={8}
        maxLength={maxMessageLength}
        showCount={lengths > maxMessageLength * 0.7}
        aria-required
        error={errors.message}
        {...(controlProps("message") as ComponentProps<typeof Textarea>)}
      />

      {errors.form && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-sheen-sm bg-sheen-danger-soft px-3 py-2 text-sm text-sheen-danger-text"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {errors.form}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        stateLight
        loading={status === "submitting"}
        data-state={status === "error" ? "error" : undefined}
      >
        {L.submit}
      </Button>
    </form>
  );

  const success = (
    <div
      role="status"
      aria-hidden={!done}
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center [grid-area:1/1]",
        !done && "invisible",
      )}
    >
      {done && (
        <>
          <SuccessSeal reduced={reduced} />
          <motion.div
            initial={reduced ? false : { y: 8 }}
            animate={{ y: 0 }}
            transition={spring.gentle}
            className="flex max-w-xs flex-col items-center gap-2"
          >
            <p ref={successRef} tabIndex={-1} className="text-xl font-semibold tracking-tight outline-none">
              {L.successTitle}
            </p>
            <p className="text-sm text-pretty text-sheen-fg-muted">{L.successText}</p>
          </motion.div>
          <Button variant="glass" onClick={again} leading={<CheckIcon />}>
            {L.another}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div
      data-slot="contact-form"
      data-status={status}
      className={cn(
        "@container grid w-full min-w-0 gap-10",
        aside && "@3xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] @3xl:items-start @3xl:gap-14",
        className,
      )}
    >
      {(Boolean(eyebrow) || Boolean(title) || Boolean(description) || Boolean(aside)) && (
        <div className="flex min-w-0 flex-col gap-4">
          {eyebrow && <p className="text-sm font-semibold tracking-widest text-sheen-accent uppercase">{eyebrow}</p>}
          {title && (
            <Heading
              id={headingId}
              className="font-sheen-display text-3xl font-semibold tracking-(--sheen-display-tracking) text-balance @xl:text-5xl"
            >
              {title}
            </Heading>
          )}
          {description && (
            <p className="max-w-md text-base text-pretty text-sheen-fg-muted @xl:text-lg">{description}</p>
          )}
          {aside && <div className="pt-4 text-sheen-fg-muted">{aside}</div>}
        </div>
      )}
      <GlassCard level={3} className="relative isolate w-full min-w-0 p-6 @xl:p-8">
        <div className="grid">
          {form}
          {success}
        </div>
      </GlassCard>
    </div>
  );
}
