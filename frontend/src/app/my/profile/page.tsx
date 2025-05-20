"use client"

import { Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-context"
import { useState } from "react"

export default function ProfileForm() {
  const { currentUser, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  }

  const handleProfileUpdate = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      await updateProfile(currentUser, { displayName });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <h2 className="text-2xl font-bold mb-8 text-center">Profile</h2>
      <div className="w-full max-w-2xl mx-auto space-y-8 p-6 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xs rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
        {currentUser?.photoURL && (
          <div className="flex items-center justify-center gap-6">
            <Avatar className="h-24 w-24 rounded-full border-2 border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <AvatarImage src={currentUser?.photoURL} className="rounded-full object-cover" />
            </Avatar>
          </div>
        )}

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">
              Display Name
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={displayName}
              autoComplete="off"
              onChange={handleDisplayNameChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">
              Email
            </Label>
            <Input
              id="email"
              disabled
              defaultValue={currentUser?.email || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username" className="text-zinc-700 dark:text-zinc-300">
              User Identifier
            </Label>
            <Input
              id="username"
              defaultValue={currentUser?.uid}
              disabled
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end gap-4">
          <Button variant="default" onClick={handleProfileUpdate} disabled={loading}>
            {loading && <Loader className="animate-spin mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
