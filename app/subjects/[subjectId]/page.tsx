"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import FormLevelCard from "@/components/FormLevelCard";
import SubjectClassCard from "@/components/SubjectClassCard";
import SubjectBreadcrumb, {
  useSubjectBreadcrumb,
} from "@/components/SubjectBreadcrumb";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import {
  getFormLevelsBySubject,
  getClassesBySubjectAndFormLevel,
} from "@/lib/api";

interface FormLevelData {
  id: string;
  name: string;
  grade: string;
  courseCount: number;
}

interface ClassData {
  id: string;
  name: string;
  section?: string;
  studentCount: number;
  formLevel?: string;
}

interface ClassesByFormLevel {
  formLevel: string;
  formLevelId: string;
  classes: ClassData[];
}

export default function SubjectDetailPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [formLevels, setFormLevels] = useState<FormLevelData[]>([]);
  const [classesByFormLevel, setClassesByFormLevel] = useState<
    ClassesByFormLevel[]
  >([]);
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
      const fetchFormLevelsAndClasses = async () => {
        try {
          setLoading(true);
          // Decode the URL-encoded subject ID to get the actual subject name
          const decodedSubjectName = decodeURIComponent(subjectId);
          setSubjectName(decodedSubjectName);

          // Get all form levels for this subject
          const formLevelResponse = await getFormLevelsBySubject(
            decodedSubjectName
          );
          const formLevelsData = formLevelResponse.data;
          setFormLevels(formLevelsData);

          // Fetch classes for each form level
          const classesPromises = formLevelsData.map(async (formLevel) => {
            try {
              const classesResponse = await getClassesBySubjectAndFormLevel(
                decodedSubjectName,
                formLevel.id
              );

              return {
                formLevel: formLevel.name,
                formLevelId: formLevel.id,
                classes: classesResponse.data.map((classItem) => ({
                  ...classItem,
                  formLevel: formLevel.grade,
                })),
              };
            } catch (err) {
              console.error(
                `Failed to fetch classes for ${formLevel.name}:`,
                err
              );
              return {
                formLevel: formLevel.name,
                formLevelId: formLevel.id,
                classes: [],
              };
            }
          });

          const classesResults = await Promise.all(classesPromises);
          // Filter out form levels with no classes
          const nonEmptyClassResults = classesResults.filter(
            (result) => result.classes.length > 0
          );
          setClassesByFormLevel(nonEmptyClassResults);
        } catch (err) {
          console.error("Failed to fetch form levels:", err);
          setError(
            "Failed to load form levels and classes. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchFormLevelsAndClasses();
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
            Select a class to view content and students
          </Text>
        </Box>
      </Flex>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <Box>
          {classesByFormLevel.length > 0 ? (
            <>
              {classesByFormLevel.map((formLevelGroup) => (
                <Box key={formLevelGroup.formLevelId} mb={5}>
                  <Heading as="h2" fontSize={3} mb={3}>
                    {formLevelGroup.formLevel}
                  </Heading>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: ["1fr", "1fr 1fr", "1fr 1fr 1fr"],
                      gap: 4,
                    }}
                  >
                    {formLevelGroup.classes.map((cls) => (
                      <SubjectClassCard
                        key={cls.id}
                        classData={{
                          id: cls.id,
                          name: cls.name,
                          section: cls.section,
                          grade: cls.formLevel || "",
                          studentCount: cls.studentCount,
                        }}
                        linkUrl={`/subjects/${encodeURIComponent(
                          subjectId
                        )}/form-levels/${encodeURIComponent(
                          formLevelGroup.formLevelId
                        )}/classes/${encodeURIComponent(cls.id)}`}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </>
          ) : (
            <Box p={4} bg="gray.100" borderRadius="default" textAlign="center">
              <Heading as="h3" fontSize={3} mb={3}>
                No classes available
              </Heading>
              <Text color="gray.600">
                This subject doesn't have any classes assigned yet.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
