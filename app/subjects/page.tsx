"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import SubjectCard from "@/components/SubjectCard";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getSubjects } from "@/lib/api";
import Button from "@/components/Button";

interface SubjectData {
  id: string;
  name: string;
  code?: string;
  description?: string;
  courseCount?: number;
  iconUrl?: string;
}

export default function SubjectsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchSubjects = async () => {
        try {
          setLoading(true);
          // Backend will handle filtering based on user role and ID from JWT token
          const response = await getSubjects();
          setSubjects(response.data);
        } catch (err) {
          console.error("Failed to fetch subjects:", err);
          setError("Failed to load subjects. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchSubjects();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  return (
    <Box as="div" className="container" py={4} px={[3, 4]}>
      <Flex alignItems="center" mb={4} flexWrap="wrap">
        <Box flex="1">
          <Heading as="h1" fontSize={[4, 5]}>
            My Subjects
          </Heading>
          <Text color="gray.600" mt={2}>
            Select a subject to view form levels and classes
          </Text>
        </Box>

        {/* Only show Create Subject button for admin and head_teacher users */}
        {user && (user.role === "admin" || user.role === "head_teacher") && (
          <Button
            onClick={() => router.push("/subjects/create")}
            variant="primary"
          >
            Create Subject
          </Button>
        )}
      </Flex>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <Box>
          {subjects.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: ["1fr", "1fr 1fr", "1fr 1fr 1fr"],
                gap: 4,
              }}
            >
              {subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </Box>
          ) : (
            <Box p={4} bg="gray.100" borderRadius="default" textAlign="center">
              <Heading as="h3" fontSize={3} mb={3}>
                No subjects available
              </Heading>
              <Text color="gray.600">
                {user?.role === "teacher"
                  ? "You aren't assigned to teach any subjects yet."
                  : "There are no subjects available in the system."}
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
