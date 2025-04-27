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
import { getSubjectById } from "@/lib/api";
import SubjectNavigation from "@/components/SubjectNavigation";
import Button from "@/components/Button";
import SubjectForm from "@/components/SubjectForm";
import Notification from "@/components/Notification";

export default function SubjectInformationPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [subject, setSubject] = useState<{
    name: string;
    description?: string;
    headTeacher?: any;
    code?: string;
    grade?: string;
    createdAt?: string;
    updatedAt?: string;
    iconUrl?: string;
    _id?: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
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
      const fetchSubjectDetails = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch subject details
          const subjectData = await getSubjectById(subjectId);
          setSubject(subjectData);
        } catch (err: any) {
          console.error("Failed to fetch subject details:", err);
          setError(
            err.message ||
              "Failed to load subject information. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchSubjectDetails();
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
        </Box>
      </Flex>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <>
          <SubjectNavigation subjectId={subjectId} activeTab="information" />

          <Box
            bg="white"
            p={4}
            sx={{
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {!isEditing ? (
              <>
                <Box mb={3}>
                  <Text fontWeight="bold" mb={1}>
                    Subject Code
                  </Text>
                  <Text color="gray.600">
                    {subject?.code || "Not specified"}
                  </Text>
                </Box>

                <Box mb={3}>
                  <Text fontWeight="bold" mb={1}>
                    Grade Level
                  </Text>
                  <Text color="gray.600">
                    {subject?.grade || "Not specified"}
                  </Text>
                </Box>

                <Box mb={3}>
                  <Text fontWeight="bold" mb={1}>
                    Head Teacher
                  </Text>
                  <Text color="gray.600">
                    {subject?.headTeacher?.name || "Not assigned"}
                  </Text>
                </Box>

                <Box mb={3}>
                  <Text fontWeight="bold" mb={1}>
                    Description
                  </Text>
                  <Text color="gray.600">
                    {subject?.description || "No description available"}
                  </Text>
                </Box>

                <Box mb={3}>
                  <Text fontWeight="bold" mb={1}>
                    Created At
                  </Text>
                  <Text color="gray.600">
                    {subject?.createdAt
                      ? new Date(subject.createdAt).toLocaleDateString()
                      : "Not available"}
                  </Text>
                </Box>

                <Box mb={3}>
                  <Text fontWeight="bold" mb={1}>
                    Last Updated
                  </Text>
                  <Text color="gray.600">
                    {subject?.updatedAt
                      ? new Date(subject.updatedAt).toLocaleDateString()
                      : "Not available"}
                  </Text>
                </Box>
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                  {canManageSubject && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="primary"
                    >
                      Edit Subject
                    </Button>
                  )}
                </Flex>
              </>
            ) : (
              <>
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                  <Heading as="h2" fontSize={3}>
                    Edit Subject
                  </Heading>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </Flex>

                <SubjectForm
                  initialData={subject}
                  onSuccess={(updatedSubject) => {
                    setSubject(updatedSubject);
                    setIsEditing(false);
                    setNotification({
                      message: "Subject updated successfully",
                      type: "success",
                    });
                  }}
                />
              </>
            )}
          </Box>
        </>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </Box>
  );
}
