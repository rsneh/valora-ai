"use client";

import { Button } from "../ui/button";
import { FormEvent } from "react";
import { useAuth } from "../auth/auth-context";
import { useRouter } from "next/navigation";

interface StartChatButtonProps {
  productId: string;
  buttonTxt: string;
}

export function StartChatButton({ productId, buttonTxt }: StartChatButtonProps) {
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
    router.push(`/chat/${productId}`);
  }

  return (
    <form onSubmit={handleStartChat}>
      <Button
        className="w-full text-lg py-3"
        variant="default"
        type="submit"
      >
        {buttonTxt}
      </Button>
    </form>
  );
}