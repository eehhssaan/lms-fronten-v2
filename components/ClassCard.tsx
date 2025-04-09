import { Box, Card, Heading, Text, Flex } from "rebass";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Class {
  _id: string;
  name: string;
  code: string;
  academicYear: string;
  department?: string;
  gradeLevel?: string;
  description?: string;
  students?: any[];
  classTeacher: {
    name: string;
    _id: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClassCardProps {
  classData: Class;
}

export default function ClassCard({ classData }: ClassCardProps) {
  const { user } = useAuth();

  return (
    <Link href={`/classes/${classData._id}`} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          p: 3,
          borderRadius: "4px",
          boxShadow: "small",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer",
          bg: "white",
          height: "100%",
          minHeight: "280px",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "large",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "8px",
            bg: "primary",
            mb: 3,
            borderRadius: "2px",
          }}
        />

        <Heading as="h3" fontSize={3} mb={2}>
          {classData.name}
        </Heading>

        <Text color="secondary" fontSize={1} mb={3}>
          Class Code: {classData.code}
        </Text>

        {classData.description && (
          <Text
            sx={{
              fontSize: 2,
              mb: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {classData.description}
          </Text>
        )}

        <Box mt="auto">
          <Flex mb={2} justifyContent="space-between" alignItems="center">
            <Text fontSize={1} color="secondary">
              <Text as="span" fontWeight="bold">
                Academic Year:
              </Text>{" "}
              {classData.academicYear}
            </Text>
          </Flex>

          {(classData.department || classData.gradeLevel) && (
            <Flex mb={2} justifyContent="space-between" alignItems="center">
              {classData.department && (
                <Text fontSize={1} color="secondary">
                  <Text as="span" fontWeight="bold">
                    Department:
                  </Text>{" "}
                  {classData.department}
                </Text>
              )}
              {classData.gradeLevel && (
                <Text
                  fontSize={1}
                  color="secondary"
                  ml={classData.department ? 2 : 0}
                >
                  <Text as="span" fontWeight="bold">
                    Grade:
                  </Text>{" "}
                  {classData.gradeLevel}
                </Text>
              )}
            </Flex>
          )}

          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Text fontSize={1} color="secondary">
              <Text as="span" fontWeight="bold">
                Teacher:
              </Text>{" "}
              {classData.classTeacher.name}
            </Text>
          </Flex>

          <Flex justifyContent="space-between" alignItems="center">
            <Box
              px={2}
              py={1}
              bg={classData.isActive ? "success" : "secondary"}
              sx={{
                borderRadius: "999px",
                display: "inline-block",
                fontSize: "12px",
                color: "white",
              }}
            >
              {classData.isActive ? "Active" : "Inactive"}
            </Box>

            <Text fontSize={1} color="secondary">
              {classData.students
                ? `${classData.students.length} students`
                : "0 students"}
            </Text>
          </Flex>
        </Box>
      </Card>
    </Link>
  );
}
