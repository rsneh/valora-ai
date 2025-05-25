import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import googleIcon from "@/assets/icons/google.svg"
import facebookIcon from "@/assets/icons/facebook.svg"
import xSocialIcon from "@/assets/icons/x-social.svg"
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import Link from "next/link";
import { useI18nContext } from "../locale-context";
import { useToast } from "@/hooks/use-toast";

interface LoginDialogProps {
  open: boolean;
  closeDialog: () => void;
  onOpenChange: (open: boolean) => void;
  openSignUpDialog: (open: boolean) => void;
}

export const LoginDialog = ({ open, onOpenChange, openSignUpDialog, closeDialog }: LoginDialogProps) => {
  const { t } = useI18nContext();
  const router = useRouter();
  const { toast } = useToast();
  const {
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInEmailAndPassword,
    resetPassword,
  } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [forgetPassword, setForgetPassword] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (forgetPassword) {
      handleResetPassword();
      return;
    }

    if (password.length < 6) {
      setError(t("authDialog.passwordMinLength"));
      return;
    }

    setLoading(true);
    try {
      await signInEmailAndPassword(email, password);
      setEmail('');
      setPassword('');
      closeDialog();
      router.push('/');
    } catch (err: Error | any) {
      if (err.code === 'auth/invalid-credential') {
        setError(t("authDialog.invalidCredentials"));
      } else {
        setError(err.message || t("authDialog.loginFailed"));
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'facebook') {
        await signInWithFacebook();
      }
      else if (provider === 'twitter') {
        await signInWithTwitter();
      }
      router.push('/');
    } catch (err: Error | any) {
      setError(err.message || t("authDialog.loginFailed"));
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError(t("authDialog.emailRequired"));
      return;
    }
    setLoading(true);
    try {
      resetPassword(email);
      toast({
        description: t("authDialog.resetPasswordSuccess"),
        variant: "success",
      });
      setEmail('');
      setForgetPassword(false);
    } catch (err: Error | any) {
      // Handle errors (e.g., user not found, invalid email)
      setError(err.message || t("authDialog.resetPasswordFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm md:max-w-4xl lg:max-w-5xl p-0 border-0">
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden">
            <div className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:py-8 lg:py-20 md:w-full md:max-w-sm md:mx-auto">
                <div className="flex flex-col gap-2">
                  <DialogHeader>
                    <DialogTitle className="text-center text-lg md:text-2xl">
                      {t("authDialog.loginDialog.title")}
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm px-2 mb-5 md:px-8">
                      {t("authDialog.loginDialog.description")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse pt-4">
                    <Button variant="outline" className="w-12 h-12 py-2 px-2" onClick={() => handleSocialSignIn('google')}>
                      <Image
                        src={googleIcon}
                        alt="Google"
                      />
                    </Button>
                    <Button variant="outline" className="w-12 h-12 py-2 px-2" onClick={() => handleSocialSignIn('twitter')}>
                      <Image
                        src={xSocialIcon}
                        alt="X"
                      />
                    </Button>
                    <Button variant="outline" className="w-12 h-12 py-2 px-2" onClick={() => handleSocialSignIn('facebook')}>
                      <Image
                        src={facebookIcon}
                        alt="Facebook"
                        className="fill-[#3a5998]"
                      />
                    </Button>
                  </div>
                  <Separator
                    className="my-2"
                    orientation="horizontal"
                  />
                  <form action="" className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <Input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("authDialog.emailPlaceholder")}
                        required
                      />
                    </div>
                    {!forgetPassword && (
                      <div className="space-y-2">
                        <Input
                          type="password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t("authDialog.passwordPlaceholder")}
                          required
                        />
                      </div>
                    )}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex flex-col items-center">
                      <Button type="submit" className="w-full" disabled={loading}>
                        {t(forgetPassword ? "authDialog.submitForgetPassword" : "authDialog.submitButton")}
                      </Button>
                      {!forgetPassword && (
                        <Button type="button" variant="link" className="text-xs" disabled={loading} onClick={() => setForgetPassword(true)}>
                          {t("authDialog.forgotPassword")}
                        </Button>
                      )}
                    </div>
                  </form>
                  <div className="text-center text-sm">
                    {t("authDialog.noAccount")}{" "}
                    <Link href="#" className="underline underline-offset-4" onClick={() => openSignUpDialog(true)}>
                      {t("authDialog.signUpLink")}
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative hidden bg-muted sm:rounded-e-lg md:block">
                <Image
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  priority
                  src="/images/background-items-2.jpg"
                  alt={t("authDialog.backgroundImageAlt")}
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale sm:rounded-e-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}