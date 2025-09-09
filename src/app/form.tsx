"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  nickname: z
    .string()
    .min(1, {
      message: "Apelido deve ter pelo menos 1 caractere.",
    })
    .max(12, { message: "Apelido deve ter no máximo 12 caracteres." }),
});

export function PlayerForm({
  setNickname,
}: {
  setNickname?: Dispatch<SetStateAction<string | null>>;
}) {
  const router = useRouter();
  const params = useParams();

  const roomId = params.room_id;

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: localStorage.getItem("nickname") ?? "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      localStorage.setItem("nickname", values.nickname);

      if (setNickname) {
        setNickname(values.nickname);
      }

      if (roomId) {
        router.push(`/room/${roomId}`);
        return;
      }

      const response = await fetch(`/api/room?nickname=${values.nickname}`);

      if (response.ok) {
        const data = await response.json();
        router.push(`/room/${data.roomId}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Insira seu apelido" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? roomId
              ? "Entrando na sala"
              : "Criando sala"
            : roomId
              ? "Entrar sala"
              : "Criar sala"}
        </Button>
      </form>
    </Form>
  );
}
