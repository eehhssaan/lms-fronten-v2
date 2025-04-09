"use client";

import { useEffect, useState } from "react";
import { Box, Heading } from "rebass";
import AssignmentList from "@/components/AssignmentList";
import AssignmentForm from "@/components/AssignmentForm";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import CourseNavigation from "@/components/CourseNavigation";
import CourseHeader from "@/components/CourseHeader";
import { getCourse } from "@/lib/api";
import { Course } from "@/types";

export default function AssignmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [showForm, setShowForm] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      const fetchCourseData = async () => {
        try {
          setLoading(true);
          setError(null);
          const courseData = await getCourse(courseId);
          setCourse(courseData);
        } catch (err: any) {
          console.error("Failed to fetch course data:", err);
          setError(
            "Failed to load course information. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchCourseData();
    }
  }, [courseId]);

  if (!courseId) {
    return <ErrorMessage message="Course ID is required" />;
  }

  if (loading) {
    return <Loading />;
  }

  if (error || !course) {
    return <ErrorMessage message={error || "Course not found"} />;
  }

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleAssignmentClick = (assignment: any) => {
    if (user?.role === "teacher" || user?.role === "admin") {
      router.push(`/assignments/${assignment._id}/grade?courseId=${courseId}`);
    } else {
      router.push(`/assignments/${assignment._id}/submit?courseId=${courseId}`);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    // Refresh the assignments list
    router.refresh();
  };

  return (
    <Box as="div" className="container" py={4}>
      <CourseHeader course={course} />
      <CourseNavigation courseId={courseId} activeTab="assignments" />

      {showForm ? (
        <AssignmentForm
          courseId={courseId}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <AssignmentList
          courseId={courseId}
          onCreateClick={handleCreateClick}
          onAssignmentClick={handleAssignmentClick}
        />
      )}
    </Box>
  );
}
