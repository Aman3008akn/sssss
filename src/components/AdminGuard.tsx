import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const navigate = useNavigate();

  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const isAdmin = profile?.is_admin;

  useEffect(() => {
    if (isLoadingSession || isLoadingProfile) {
      return; // Do nothing while loading
    }

    if (!session) {
      navigate("/auth");
    } else if (!isAdmin) {
      navigate("/"); // Redirect non-admin users to home
    }
  }, [session, isAdmin, isLoadingSession, isLoadingProfile, navigate]);

  if (isLoadingSession || isLoadingProfile || !session || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;

// Helper to check if a pathname ends with '/admin'
export function pathnameEndsWithAdmin(pathname: string) {
  if (!pathname) return false;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  return parts[parts.length - 1].toLowerCase() === "admin";
}
