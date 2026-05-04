
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { Recipient } from "@/lib/types";

const recipientFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  phone: z.string().optional(),
  relationship: z
    .string()
    .min(2, { message: "O relacionamento deve ter pelo menos 2 caracteres." }),
});

type RecipientFormValues = z.infer<typeof recipientFormSchema>;

interface RecipientFormProps {
  initialData?: Recipient | null;
  onSubmit: (data: RecipientFormValues) => Promise<void>;
  isSaving: boolean;
}

export function RecipientForm({
  initialData,
  onSubmit,
  isSaving,
}: RecipientFormProps) {
  const form = useForm<RecipientFormValues>({
    resolver: zodResolver(recipientFormSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      relationship: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: João da Silva"
                  {...field}
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Ex: joao.silva@exemplo.com"
                  {...field}
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (Opcional)</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="(XX) XXXXX-XXXX"
                  {...field}
                  value={field.value ?? ""}
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relacionamento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Filho, Amiga, Cônjuge"
                  {...field}
                  disabled={isSaving}
                />
              </FormControl>
              <FormDescription>
                Como você se relaciona com essa pessoa?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Salvar Alterações" : "Adicionar Destinatário"}
        </Button>
      </form>
    </Form>
  );
}
