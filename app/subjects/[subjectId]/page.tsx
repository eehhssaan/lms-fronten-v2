"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import FormLevelCard from "@/components/FormLevelCard";
import SubjectBreadcrumb, {
  useSubjectBreadcrumb,
} from "@/components/SubjectBreadcrumb";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getFormLevelsBySubject } from "@/lib/api";

interface FormLevelData {
  id: string;
  name: string;
  grade: string;
  courseCount: number;
}

export default function SubjectDetailPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [formLevels, setFormLevels] = useState<FormLevelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState<string>("");
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;
  const breadcrumbItems = useSubjectBreadcrumb();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && subjectId) {
      const fetchFormLevels = async () => {
        try {
          setLoading(true);
          // Decode the URL-encoded subject ID to get the actual subject name
          const decodedSubjectName = decodeURIComponent(subjectId);
          setSubjectName(decodedSubjectName);

          const response = await getFormLevelsBySubject(decodedSubjectName);
          setFormLevels(response.data);
        } catch (err) {
          console.error("Failed to fetch form levels:", err);
          setError("Failed to load form levels. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchFormLevels();
    }
  }, [isAuthenticated, subjectId]);

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  return (
    <Box as="div" className="container" py={4} px={[3, 4]}>
      <SubjectBreadcrumb items={breadcrumbItems} />

      <Flex alignItems="center" mb={4} flexWrap="wrap">
        <Box flex="1">
          <Heading as="h1" fontSize={[4, 5]}>
            {subjectName}
          </Heading>
          <Text color="gray.600" mt={2}>
            Select a form level to view classes
          </Text>
        </Box>
      </Flex>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <Box>
          {formLevels.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: ["1fr", "1fr 1fr", "1fr 1fr 1fr"],
                gap: 4,
              }}
            >
              {formLevels.map((formLevel) => (
                <FormLevelCard
                  key={formLevel.id}
                  formLevel={formLevel}
                  subjectId={subjectId}
                />
              ))}
            </Box>
          ) : (
            <Box p={4} bg="gray.100" borderRadius="default" textAlign="center">
              <Heading as="h3" fontSize={3} mb={3}>
                No form levels available
              </Heading>
              <Text color="gray.600">
                This subject isn't taught at any form levels yet.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
