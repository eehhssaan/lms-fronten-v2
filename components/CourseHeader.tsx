import { Box, Heading, Text } from "rebass";
import { Course } from "@/types";

interface CourseHeaderProps {
  course: Course;
}

export default function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <Box mb={4}>
      <Heading as="h1">{course.title}</Heading>
      <Text color="secondary" mt={2}>
        {course.code}
      </Text>
      <Text mt={3}>{course.description}</Text>
    </Box>
  );
}
