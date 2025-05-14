import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import googleIcon from "@/assets/icons/google.svg"
import facebookIcon from "@/assets/icons/facebook.svg"
import xSocialIcon from "@/assets/icons/x-social.svg"
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Separator } from "../ui/separator";
import { auth } from "@/services/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface RegisterDialogProps {
  open: boolean;
  closeDialog: () => void;
  onOpenChange: (open: boolean) => void;
  openSignInDialog: (open: boolean) => void;
}

export const RegisterDialog = ({ open, onOpenChange, openSignInDialog, closeDialog }: RegisterDialogProps) => {
  const router = useRouter();
  const { signInWithGoogle, signInWithFacebook, signInWithTwitter } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      closeDialog();
      router.push('/');
    } catch (err: Error | any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered.');
      } else {
        setError(err.message || "Failed to register. Please try again.");
      }
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
            Create an Account
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center text-sm px-2 mb-5">
          Browse our categories to find what you need, or post your own items for sale.
        </DialogDescription>
        <div className="flex items-center justify-center space-x-3">
          <Button variant="outline" className="w-12 h-12 py-2 px-2" onClick={signInWithGoogle}>
            <Image
              src={googleIcon}
              alt="Google Icon"
            />
          </Button>
          <Button variant="outline" className="w-12 h-12 py-2 px-2 bg-[#3a5998]" onClick={signInWithFacebook}>
            <Image
              src={facebookIcon}
              alt="Facebook Icon"
              className="fill-blue-500"
            />
          </Button>
          <Button variant="outline" className="w-12 h-12 py-2 px-2 bg-black" onClick={signInWithTwitter}>
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
              placeholder="Email"
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
          <div className="space-y-2">
            <Input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex flex-col items-center">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
        <div className="flex flex-col items-center">
          <Button variant="ghost" className="text-sm" onClick={() => openSignInDialog(true)}>
            Already have an account? Sign in.
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}