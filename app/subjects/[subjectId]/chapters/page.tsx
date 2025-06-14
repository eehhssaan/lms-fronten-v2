"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import SubjectBreadcrumb, {
  useSubjectBreadcrumb,
} from "@/components/SubjectBreadcrumb";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getSubjectById, getSubjectChapters } from "@/lib/api";
import { Chapter } from "@/types";
import SubjectNavigation from "@/components/SubjectNavigation";
import ChapterManager from "@/components/ChapterManager";

export default function SubjectChaptersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [subject, setSubject] = useState<{
    name: string;
    description?: string;
    headTeacher?: any;
  }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;

  const breadcrumbItems = useSubjectBreadcrumb(subject?.name);

  const handleCreateContent = (chapterId: string) => {
    router.push(`/subjects/${subjectId}/presentation?chapterId=${chapterId}`);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && subjectId) {
      const fetchSubjectAndChapters = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch subject details
          const subjectData = await getSubjectById(subjectId);
          setSubject(subjectData);

          // Fetch subject chapters
          const chaptersResponse = await getSubjectChapters(subjectId);
          setChapters(chaptersResponse.data);
        } catch (err: any) {
          console.error("Failed to fetch subject details or chapters:", err);
          setError(
            err.message ||
              "Failed to load subject data. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchSubjectAndChapters();
    }
  }, [isAuthenticated, subjectId]);

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  const isAdminOrHeadTeacher =
    user?.role === "admin" || user?.role === "head_teacher";
  const isHeadTeacherOfSubject =
    subject?.headTeacher && user?._id === subject.headTeacher._id;
  const canManageSubject = isAdminOrHeadTeacher || isHeadTeacherOfSubject;

  return (
    <Box as="div" className="container" py={4} px={[3, 4]}>
      <SubjectBreadcrumb items={breadcrumbItems} />

      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb={4}
        flexWrap="wrap"
      >
        <Box flex="1" mb={[3, 0]}>
          <Heading as="h1" fontSize={[4, 5]}>
            {subject?.name || "Subject"}
          </Heading>
          {subject?.description && (
            <Text color="gray.600" mt={2}>
              {subject.description}
            </Text>
          )}
          {subject?.headTeacher && (
            <Text color="gray.600" mt={1}>
              Head Teacher: {subject.headTeacher.name}
            </Text>
          )}
        </Box>
      </Flex>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <>
          <SubjectNavigation subjectId={subjectId} activeTab="chapters" />

          <Box>
            <Box
              bg="white"
              p={4}
              sx={{
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <ChapterManager
                subjectId={subjectId}
                chapters={chapters}
                onChaptersUpdated={() => {
                  // Refresh chapters
                  getSubjectChapters(subjectId).then((response) => {
                    setChapters(response.data);
                  });
                }}
                canManage={canManageSubject}
                onCreateContent={handleCreateContent}
              />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
