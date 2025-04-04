"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import { getClass } from "@/lib/api";

interface Class {
  _id: string;
  name: string;
  code: string;
  academicYear: string;
  department?: string;
  gradeLevel?: string;
  description?: string;
  students: string[];
  classTeacher: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function ClassDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [classDetails, setClassDetails] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  // Only teachers and admins can access this page
  if (user && user.role !== "teacher" && user.role !== "admin") {
    router.push("/courses");
    return null;
  }

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getClass(params.id);
        setClassDetails(data);
      } catch (err: any) {
        console.error("Failed to fetch class details:", err);
        setError(err.message || "Failed to load class details");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && params.id) {
      fetchClassDetails();
    }
  }, [isAuthenticated, params.id]);

  if (authLoading || loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Box className="container" py={4}>
        <ErrorMessage message={error} />
        <Button
          variant="secondary"
          onClick={() => router.push("/classes")}
          sx={{ mt: 3 }}
        >
          Back to Classes
        </Button>
      </Box>
    );
  }

  if (!classDetails) {
    return (
      <Box className="container" py={4}>
        <Text>Class not found</Text>
        <Button
          variant="secondary"
          onClick={() => router.push("/classes")}
          sx={{ mt: 3 }}
        >
          Back to Classes
        </Button>
      </Box>
    );
  }

  return (
    <Box as="div" className="container" py={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Heading as="h1" mb={2}>
            {classDetails.name}
          </Heading>
          <Text color="gray" fontSize={2}>
            Code: {classDetails.code}
          </Text>
        </Box>
        <Button variant="secondary" onClick={() => router.push("/classes")}>
          Back to Classes
        </Button>
      </Flex>

      <Box className="card" p={4} mb={4}>
        <Box mb={4}>
          <Heading as="h2" fontSize={3} mb={3}>
            Class Information
          </Heading>
          <Box mb={3}>
            <Text fontWeight="bold">Academic Year</Text>
            <Text>{classDetails.academicYear}</Text>
          </Box>
          {classDetails.department && (
            <Box mb={3}>
              <Text fontWeight="bold">Department</Text>
              <Text>{classDetails.department}</Text>
            </Box>
          )}
          {classDetails.gradeLevel && (
            <Box mb={3}>
              <Text fontWeight="bold">Grade Level</Text>
              <Text>{classDetails.gradeLevel}</Text>
            </Box>
          )}
          {classDetails.description && (
            <Box mb={3}>
              <Text fontWeight="bold">Description</Text>
              <Text>{classDetails.description}</Text>
            </Box>
          )}
          <Box mb={3}>
            <Text fontWeight="bold">Status</Text>
            <Text>{classDetails.isActive ? "Active" : "Inactive"}</Text>
          </Box>
        </Box>

        <Box>
          <Heading as="h2" fontSize={3} mb={3}>
            Students
          </Heading>
          {classDetails.students.length === 0 ? (
            <Text color="gray">No students enrolled yet</Text>
          ) : (
            <Text>Number of students: {classDetails.students.length}</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
