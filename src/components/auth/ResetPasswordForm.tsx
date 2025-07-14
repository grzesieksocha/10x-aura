import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        toast.error(data.error);
      } else {
        setSuccess(true);
        toast.success("If this email exists, a reset link has been sent.");
      }
    } catch (err) {
      setError("Network error");
      toast.error("Network error");
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        {success && (
          <div className="mt-4 text-green-600 text-center text-sm">
            If this email exists, a reset link has been sent.
          </div>
        )}
        <div className="mt-4 text-center text-sm">
          <a href="/login" className="text-primary underline">
            Back to login
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
