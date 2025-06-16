"use client";

import { useEffect, useState } from "react";
import { Box } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getCourse } from "@/lib/api";
import { Course } from "@/types";
import CourseNavigation from "@/components/CourseNavigation";
import CourseHeader from "@/components/CourseHeader";
import PresentationsList from "@/components/PresentationsList";
import { use } from "react";

export default function CoursePresentationsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams =
    typeof params === "object" && !("then" in params)
      ? params
      : use(params as Promise<{ id: string }>);

  const courseId = resolvedParams.id;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && courseId) {
      const fetchCourseData = async () => {
        try {
          setLoading(true);
          setError(null);
          const courseData = await getCourse(courseId);
          setCourse(courseData);
        } catch (err: any) {
          console.error("Failed to fetch course data:", err);
          setError(
            err.message ||
              "Failed to load course information. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchCourseData();
    }
  }, [isAuthenticated, courseId]);

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box as="div" className="container" py={4}>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : !course ? (
        <ErrorMessage message="Course not found" />
      ) : (
        <>
          <CourseHeader course={course} />
          <CourseNavigation courseId={courseId} activeTab="presentations" />

          <Box mt={4}>
            <PresentationsList courseId={courseId} />
          </Box>
        </>
      )}
    </Box>
  );
}
