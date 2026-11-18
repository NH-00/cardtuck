"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useZodForm } from "@/features/common/hooks/use-zod-form";
import { authSchema } from "../../schemas/auth.schema";

interface AuthFormProps {
  callbackURL?: string;
  defaultValue?: string;
  onSent: (email: string) => void;
  onEmergency: (email?: string) => void;
  onMutationStart?: () => void;
}

export function AuthForm({
  callbackURL,
  defaultValue,
  onSent,
  onEmergency,
  onMutationStart,
}: AuthFormProps) {
  const t = useTranslations("auth.login");

  const form = useZodForm({
    schema: authSchema,
    defaultValues: { email: defaultValue || "" },
    mode: "onChange",
  });

  const { mutate: auth, isPending } = useAuth(callbackURL, onSent);

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Form
        form={form}
        className="space-y-3"
        onSubmit={(v) => {
          onMutationStart?.();
          auth(v);
        }}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <label htmlFor="signin-email" className="text-sm font-semibold">{t("email_placeholder")}</label>
              <FormControl>
                <Input
                  id="signin-email" placeholder={t("email_placeholder")}
                  {...field}
                  type="email" autoComplete="email" aria-label={t("email_placeholder")} className="h-11 bg-white px-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="default"
            disabled={isPending}
            className="min-h-11 w-full font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {t("submit")}
          </Button>
        </div>
      </Form>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => onEmergency(form.getValues("email"))}
          className="text-primary hover:underline text-sm transition-colors font-medium border-b border-transparent hover:border-black cursor-pointer"
        >
          {t("emergency_trigger")}
        </button>
      </div>
    </div>
  );
}
