import { wait } from "../demo-utils";
import { useForm } from "react-hook-form";
import { useToast, type ContactFormStatus, type ContactFormValues } from "@sheenui/theme";

import { ContactForm } from "../../../theme/src/blocks/contact-form";

/** The react-hook-form example: the form library validates, the block draws. */
export function HookFormDemo() {
  const toast = useToast();
  const { register, handleSubmit, reset, formState } = useForm<ContactFormValues>();
  const { errors, isSubmitting, isSubmitSuccessful } = formState;
  const status: ContactFormStatus = isSubmitting ? "submitting" : isSubmitSuccessful ? "success" : "idle";
  const send = async (values: ContactFormValues) => {
    await wait(1200);
    toast.success("Message sent", `We will reply to ${values.email}.`);
  };
  return (
    <ContactForm
      headingLevel="none"
      title="Write to us"
      validate={false}
      status={status}
      errors={{ name: errors.name?.message, email: errors.email?.message, message: errors.message?.message }}
      fieldProps={{
        name: register("name", { required: "Enter your name." }),
        email: register("email", {
          required: "Enter your email.",
          pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
        }),
        message: register("message", {
          required: "Write a message.",
          minLength: { value: 10, message: "Write at least 10 characters." },
        }),
      }}
      onSubmit={() => handleSubmit(send)()}
      onReset={() => reset()}
    />
  );
}
