import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to logout");
      } else {
        toast.success("Logged out successfully");
        // Redirect to login page
        window.location.href = "/login";
      }
    } catch {
      toast.error("Network error");
    }

    setLoading(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}
