"use client";

import React from "react";
import { Box } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function SubjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  return (
    <Box
      as="main"
      className="subject-layout"
      sx={{
        width: "100%",
        maxWidth: "1200px",
        mx: "auto",
        px: [3, 4],
      }}
    >
      {children}
    </Box>
  );
}
