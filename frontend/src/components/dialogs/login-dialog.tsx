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
import { useAuth } from "@/contexts/AuthContext";

interface LoginDialogProps {
  open: boolean;
  closeDialog: () => void;
  onOpenChange: (open: boolean) => void;
  openSignUpDialog: (open: boolean) => void;
}

export const LoginDialog = ({ open, onOpenChange, openSignUpDialog, closeDialog }: LoginDialogProps) => {
  const router = useRouter();
  const { signInWithGoogle, signInWithFacebook, signInWithTwitter, signInEmailAndPassword } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
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
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid Email or Password.');
      } else {
        setError(err.message || "Failed to login. Please try again.");
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
      setError(err.message || "Failed to register. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg md:text-2xl">
            Welcome back!
          </DialogTitle>
          <DialogDescription className="text-center text-sm md:text-base">
            {`Please sign in to your account.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center space-x-3">
          <Button variant="outline" className="w-12 h-12 py-2 px-2" onClick={() => handleSocialSignIn('google')}>
            <Image
              src={googleIcon}
              alt="Google Icon"
            />
          </Button>
          <Button variant="outline" className="w-12 h-12 py-2 px-2 bg-[#3a5998]" onClick={() => handleSocialSignIn('facebook')}>
            <Image
              src={facebookIcon}
              alt="Facebook Icon"
              className="fill-blue-500"
            />
          </Button>
          <Button variant="outline" className="w-12 h-12 py-2 px-2 bg-black" onClick={() => handleSocialSignIn('twitter')}>
            <Image
              src={xSocialIcon}
              alt="X Social Icon"
              className="fill-blue-500"
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
              placeholder="Email Address"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex flex-col items-center">
            <Button type="submit" className="w-full" disabled={loading}>
              Submit
            </Button>
            <Button variant="link" className="text-xs">
              Forgot password?
            </Button>
          </div>
        </form>
        <div className="flex flex-col items-center">
          <Button variant="ghost" className="text-sm" onClick={() => openSignUpDialog(true)}>
            {`Don't have an account? Sign up.`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}