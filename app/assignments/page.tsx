"use client";

import { useState, useEffect } from "react";
import { Box, Heading } from "rebass";
import AssignmentList from "@/components/AssignmentList";
import AssignmentForm from "@/components/AssignmentForm";
import CourseNavigation from "@/components/CourseNavigation";
import CourseHeader from "@/components/CourseHeader";
import { Assignment, Course } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { getCourse } from "@/lib/api";

export default function AssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId) {
        try {
          const courseData = await getCourse(courseId);
          setCourse(courseData);
        } catch (error) {
          console.error("Failed to fetch course:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCourse();
  }, [courseId]);

  if (!courseId) {
    return <Box p={4}>Course ID is required</Box>;
  }

  if (loading) {
    return <Box p={4}>Loading...</Box>;
  }

  const handleCreateClick = () => {
    setEditingAssignment(null);
    setShowForm(true);
  };

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    router.push(`/assignments/${assignment.id}?courseId=${courseId}`);
  };

  return (
    <Box p={4}>
      {course && <CourseHeader course={course} />}
      <CourseNavigation courseId={courseId} activeTab="assignments" />
      <Heading as="h1" mb={4}>
        Course Assignments
      </Heading>

      {showForm ? (
        <AssignmentForm
          courseId={courseId}
          assignment={editingAssignment || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <AssignmentList
          courseId={courseId}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          onAssignmentClick={handleAssignmentClick}
        />
      )}
    </Box>
  );
}
