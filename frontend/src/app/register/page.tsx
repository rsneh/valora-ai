"use client"

import { useState, FormEvent } from "react"
import { auth } from '@/services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


export default function RegisterPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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
      // Registration successful, redirect to login or home
      router.push('/'); // Redirect to home page after registration
    } catch (err: any) {
      // Handle Firebase errors (e.g., email-already-in-use)
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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container py-8">
        <div className="max-w-lg mx-auto">
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sign up</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form action="" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="•••••••• (min. 6 characters)"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>
                  <Button className="w-full" disabled={loading} type="submit">
                    {loading ? 'Creating...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
