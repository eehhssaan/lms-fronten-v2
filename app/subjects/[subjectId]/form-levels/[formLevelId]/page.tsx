"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Box, Heading, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import SubjectClassCard from "@/components/SubjectClassCard";
import SubjectBreadcrumb, {
  useSubjectBreadcrumb,
} from "@/components/SubjectBreadcrumb";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getClassesBySubjectAndFormLevel, getSubjectById } from "@/lib/api";

interface ClassData {
  id: string;
  name: string;
  section?: string;
  studentCount: number;
}

export default function FormLevelDetailPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState<string>("");
  const [formLevelName, setFormLevelName] = useState<string>("");
  const [decodedFormLevelId, setDecodedFormLevelId] = useState<string>("");
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;
  const formLevelId = params?.formLevelId as string;

  // Move the hook outside of useMemo
  const breadcrumbItems = useSubjectBreadcrumb(subjectName);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && subjectId && formLevelId) {
      const fetchClasses = async () => {
        try {
          setLoading(true);

          // First fetch the subject to get the subject name
          try {
            const subjectData = await getSubjectById(subjectId);
            setSubjectName(subjectData.name);
          } catch (err) {
            console.error("Failed to fetch subject:", err);
            // Fallback to decoded ID if we can't get the subject name
            setSubjectName(decodeURIComponent(subjectId));
          }

          // Decode the form level ID
          const formLevelDecoded = decodeURIComponent(
            decodeURIComponent(formLevelId)
          );

          setFormLevelName(
            formLevelDecoded.includes("Form")
              ? formLevelDecoded
              : `Form ${formLevelDecoded}`
          );
          setDecodedFormLevelId(formLevelDecoded);

          const response = await getClassesBySubjectAndFormLevel(
            subjectName,
            formLevelDecoded
          );

          setClasses(response.data);
        } catch (err) {
          console.error("Failed to fetch classes:", err);
          setError("Failed to load classes. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchClasses();
    }
  }, [isAuthenticated, subjectId, formLevelId]);

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
            {subjectName} - {formLevelName}
          </Heading>
          <Text color="gray.600" mt={2}>
            Select a class to view content and students
          </Text>
        </Box>
      </Flex>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <Box>
          {classes.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: ["1fr", "1fr 1fr", "1fr 1fr 1fr"],
                gap: 4,
              }}
            >
              {classes.map((cls) => (
                <SubjectClassCard
                  key={cls.id}
                  classData={{
                    id: cls.id,
                    name: cls.name,
                    section: cls.section,
                    grade: decodedFormLevelId.replace("Form ", ""),
                    studentCount: cls.studentCount,
                  }}
                  linkUrl={`/subjects/${encodeURIComponent(
                    subjectId
                  )}/form-levels/${encodeURIComponent(
                    formLevelId
                  )}/classes/${encodeURIComponent(cls.id)}`}
                />
              ))}
            </Box>
          ) : (
            <Box p={4} bg="gray.100" borderRadius="default" textAlign="center">
              <Heading as="h3" fontSize={3} mb={3}>
                No classes available
              </Heading>
              <Text color="gray.600">
                There are no classes assigned to this subject and form level
                yet.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
