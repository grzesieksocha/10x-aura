import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/db/supabase.client";
import { toast } from "sonner";

export default function SetNewPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabaseClient.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Password has been set. You may now log in.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting..." : "Set New Password"}
          </Button>
        </form>
        {success && (
          <div className="mt-4 text-green-600 text-center text-sm">
            Password has been set. You may now{" "}
            <a href="/login" className="underline">
              log in
            </a>
            .
          </div>
        )}
      </CardContent>
    </Card>
  );
}
