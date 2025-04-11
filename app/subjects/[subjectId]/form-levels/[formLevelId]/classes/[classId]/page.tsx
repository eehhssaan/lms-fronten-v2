"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Flex, Text, Button } from "rebass";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import SubjectBreadcrumb, {
  useSubjectBreadcrumb,
} from "@/components/SubjectBreadcrumb";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getClass } from "@/lib/api";
import { Class } from "@/types";

export default function ClassDetailPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;
  const formLevelId = params?.formLevelId as string;
  const classId = params?.classId as string;
  const breadcrumbItems = useSubjectBreadcrumb();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && classId) {
      const fetchClassDetails = async () => {
        try {
          setLoading(true);
          const classResponse = await getClass(classId);
          setClassData(classResponse);
        } catch (err) {
          console.error("Failed to fetch class details:", err);
          setError("Failed to load class information. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchClassDetails();
    }
  }, [isAuthenticated, classId]);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  return (
    <Box as="div" className="container" py={4} px={[3, 4]}>
      <SubjectBreadcrumb items={breadcrumbItems} />

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : classData ? (
        <>
          <Flex
            alignItems="flex-start"
            justifyContent="space-between"
            mb={4}
            flexWrap="wrap"
          >
            <Box flex="1" mb={[3, 0]}>
              <Heading as="h1" fontSize={[4, 5]}>
                {classData.name}
              </Heading>
              <Text color="gray.600" mt={2}>
                Form{" "}
                {decodeURIComponent(decodeURIComponent(formLevelId))
                  .replace("Form", "")
                  .trim()}
                {classData.section ? `, Section ${classData.section}` : ""}
              </Text>
              {classData.teacher && (
                <Text color="gray.700" mt={1}>
                  Teacher: {classData.teacher.name}
                </Text>
              )}
            </Box>

            {isTeacherOrAdmin && (
              <Flex mt={[3, 0]}>
                <Button
                  variant="outline"
                  mr={2}
                  sx={{
                    px: 3,
                    py: 2,
                    bg: "white",
                    color: "primary",
                    border: "1px solid",
                    borderColor: "primary",
                    borderRadius: "4px",
                    cursor: "pointer",
                    "&:hover": {
                      bg: "rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  Manage Class
                </Button>
                <Button
                  sx={{
                    px: 3,
                    py: 2,
                    bg: "primary",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    "&:hover": {
                      bg: "primary",
                      opacity: 0.9,
                    },
                  }}
                >
                  Add Content
                </Button>
              </Flex>
            )}
          </Flex>

          <Box mt={4}>
            <Tabs
              index={activeTab}
              onChange={handleTabChange}
              variant="enclosed"
              colorScheme="blue"
            >
              <TabList mb={4}>
                <Tab>Overview</Tab>
                <Tab>Course Content</Tab>
                <Tab>Students</Tab>
                <Tab>Assignments</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
                    <Heading as="h3" fontSize={3} mb={3}>
                      Class Overview
                    </Heading>

                    <Text color="gray.600" mb={4}>
                      View and manage this class's information, students, and
                      course content.
                    </Text>

                    <Box mt={4}>
                      <Heading as="h4" fontSize={2} mb={3}>
                        Class Statistics
                      </Heading>

                      <Flex flexWrap="wrap">
                        <Box
                          width={[1, 1 / 2, 1 / 3]}
                          p={3}
                          bg="gray.50"
                          mb={3}
                          mr={[0, 3]}
                          borderRadius="md"
                        >
                          <Text fontSize={1} color="gray.600">
                            Students
                          </Text>
                          <Text fontSize={4} fontWeight="bold">
                            {classData.students?.length || 0}
                          </Text>
                        </Box>

                        <Box
                          width={[1, 1 / 2, 1 / 3]}
                          p={3}
                          bg="gray.50"
                          mb={3}
                          mr={[0, 3]}
                          borderRadius="md"
                        >
                          <Text fontSize={1} color="gray.600">
                            Courses
                          </Text>
                          <Text fontSize={4} fontWeight="bold">
                            {classData.courses?.length || 0}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                  </Box>
                </TabPanel>

                <TabPanel>
                  <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
                    <Heading as="h3" fontSize={3} mb={3}>
                      Course Content
                    </Heading>

                    {classData.courses && classData.courses.length > 0 ? (
                      <Box>
                        {classData.courses.map((course) => (
                          <Box
                            key={course.id}
                            p={3}
                            mb={3}
                            bg="gray.50"
                            borderRadius="md"
                            sx={{
                              cursor: "pointer",
                              "&:hover": {
                                bg: "gray.100",
                              },
                            }}
                            onClick={() => router.push(`/courses/${course.id}`)}
                          >
                            <Heading as="h4" fontSize={2}>
                              {course.title}
                            </Heading>
                            <Text fontSize={1} color="gray.600">
                              Code: {course.code}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Text color="gray.600">
                        No courses have been assigned to this class yet.
                      </Text>
                    )}
                  </Box>
                </TabPanel>

                <TabPanel>
                  <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
                    <Heading as="h3" fontSize={3} mb={3}>
                      Students
                    </Heading>

                    {classData.students && classData.students.length > 0 ? (
                      <Box as="table" width="100%">
                        <Box as="thead">
                          <Box
                            as="tr"
                            borderBottom="1px solid"
                            borderColor="gray.200"
                          >
                            <Box as="th" textAlign="left" p={2} fontSize={1}>
                              Name
                            </Box>
                            <Box as="th" textAlign="left" p={2} fontSize={1}>
                              Email
                            </Box>
                            {isTeacherOrAdmin && (
                              <Box as="th" textAlign="right" p={2} fontSize={1}>
                                Actions
                              </Box>
                            )}
                          </Box>
                        </Box>
                        <Box as="tbody">
                          {classData.students.map((student) => (
                            <Box
                              as="tr"
                              key={student.id}
                              borderBottom="1px solid"
                              borderColor="gray.100"
                              sx={{
                                "&:hover": {
                                  bg: "gray.50",
                                },
                              }}
                            >
                              <Box as="td" p={2}>
                                {student.name}
                              </Box>
                              <Box as="td" p={2}>
                                {student.email}
                              </Box>
                              {isTeacherOrAdmin && (
                                <Box as="td" textAlign="right" p={2}>
                                  <Button
                                    sx={{
                                      px: 2,
                                      py: 1,
                                      fontSize: 0,
                                      bg: "transparent",
                                      color: "primary",
                                      border: "none",
                                      cursor: "pointer",
                                      "&:hover": {
                                        textDecoration: "underline",
                                      },
                                    }}
                                  >
                                    View
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Text color="gray.600">
                        No students have been enrolled in this class yet.
                      </Text>
                    )}
                  </Box>
                </TabPanel>

                <TabPanel>
                  <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
                    <Heading as="h3" fontSize={3} mb={3}>
                      Assignments
                    </Heading>

                    <Text color="gray.600">
                      Assignment management is available within each specific
                      course.
                    </Text>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </>
      ) : (
        <Box p={4} bg="gray.100" borderRadius="default" textAlign="center">
          <Heading as="h3" fontSize={3} mb={3}>
            Class not found
          </Heading>
          <Text color="gray.600">
            The class you're looking for doesn't exist or you don't have
            permission to view it.
          </Text>
        </Box>
      )}
    </Box>
  );
}
