"use client"

import { useAuth } from "@/components/auth/auth-context";
import { useI18nContext } from "@/components/locale-context";
import { useEffect } from "react";

interface MyLayoutClientProps {
  children: React.ReactNode;
}

export function MyLayoutClient({ children }: MyLayoutClientProps) {
  const { currentUser, loadingAuth, setShowLoginDialog } = useAuth();
  const { t } = useI18nContext();

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      setShowLoginDialog(true);
    }
  }, [currentUser, loadingAuth, setShowLoginDialog]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md px-4">
          <h2 className="text-3xl font-bold text-gray-800">{t("my.dashboardTitle")}</h2>
          <p className="text-gray-600 text-lg">
            {t("my.dashboardDescription")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
