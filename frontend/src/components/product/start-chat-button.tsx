"use client";

import { Product } from "@/types/product";
import { Button } from "../ui/button";
import { FormEvent } from "react";
import { useAuth } from "../auth/auth-context";
import { useRouter } from "next/navigation";

export function StartChatButton({ product }: { product: Product }) {
  const router = useRouter();
  const {
    currentUser,
    setShowRegisterDialog,
  } = useAuth();

  function handleStartChat(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (!currentUser) {
      setShowRegisterDialog(true);
      return;
    }
    router.push(`/chat/${product.id}`);
  }

  return (
    <form onSubmit={handleStartChat}>
      <Button
        className="w-full text-lg py-3"
        variant="default"
        type="submit"
      >
        Start AI Chat
      </Button>
    </form>
  );
}