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
import { getSubjectById, getSubjectContents } from "@/lib/api";
import { Content } from "@/types";
import Button from "@/components/Button";
import SubjectContentManager from "@/components/SubjectContentManager";
import SubjectContent from "@/components/SubjectContent";
import SubjectNavigation from "@/components/SubjectNavigation";

export default function SubjectDetailPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [subject, setSubject] = useState<{
    name: string;
    description?: string;
    headTeacher?: any;
  }>();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContentManager, setShowContentManager] = useState(false);
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;

  const breadcrumbItems = useSubjectBreadcrumb(subject?.name);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && subjectId) {
      const fetchSubjectAndContents = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch subject details
          const subjectData = await getSubjectById(subjectId);
          setSubject(subjectData);

          // Fetch subject contents
          const contentsData = await getSubjectContents(subjectId);
          setContents(contentsData);
        } catch (err: any) {
          console.error("Failed to fetch subject details or contents:", err);
          setError(
            err.message ||
              "Failed to load subject data. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchSubjectAndContents();
    }
  }, [isAuthenticated, subjectId]);

  const refreshContents = async () => {
    try {
      const contentsData = await getSubjectContents(subjectId);
      setContents(contentsData);
    } catch (err) {
      console.error("Failed to refresh contents:", err);
    }
  };

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
          <SubjectNavigation subjectId={subjectId} activeTab="content" />

          {canManageSubject && (
            <Box mb={4}>
              <Flex justifyContent="space-between" alignItems="center" mb={3}>
                <Button
                  onClick={() => setShowContentManager(!showContentManager)}
                  variant="secondary"
                  size="small"
                >
                  {showContentManager
                    ? "Hide Content Manager"
                    : "Manage Content"}
                </Button>
              </Flex>

              {showContentManager && (
                <Box
                  bg="white"
                  p={4}
                  mb={4}
                  sx={{
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <SubjectContentManager
                    subjectId={subjectId}
                    contents={contents}
                    onContentAdded={refreshContents}
                  />
                </Box>
              )}
            </Box>
          )}

          <Box>
            {contents.length > 0 ? (
              <Box
                bg="white"
                p={4}
                sx={{
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <SubjectContent
                  contents={contents}
                  subjectId={subjectId}
                  onContentDeleted={refreshContents}
                  canManageSubject={canManageSubject}
                />
              </Box>
            ) : (
              <Box
                p={4}
                bg="white"
                sx={{
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}
              >
                <Text
                  color="gray.600"
                  fontSize={2}
                  mb={canManageSubject ? 3 : 0}
                >
                  No content available for this subject yet.
                </Text>
                {canManageSubject && !showContentManager && (
                  <Button
                    onClick={() => setShowContentManager(true)}
                    variant="secondary"
                    size="small"
                  >
                    Add Subject Content
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
