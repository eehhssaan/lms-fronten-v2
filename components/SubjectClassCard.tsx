import React from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Link from "next/link";

interface SubjectClassCardProps {
  classData: {
    id: string;
    name: string;
    section?: string;
    grade: string;
    studentCount: number;
  };
  linkUrl: string;
}

const SubjectClassCard: React.FC<SubjectClassCardProps> = ({
  classData,
  linkUrl,
}) => {
  const { id, name, section, grade } = classData;

  // Ensure the grade is properly decoded
  const formattedGrade = grade.includes("%")
    ? decodeURIComponent(grade)
    : grade;

  return (
    <Link href={linkUrl} passHref>
      <Box
        as="div"
        sx={{
          p: 3,
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          bg: "white",
          border: "1px solid",
          borderColor: "gray.200",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "6px",
            bg: "primary",
            mb: 3,
            borderRadius: "2px",
          }}
        />

        <Heading as="h3" fontSize={3} mb={2}>
          {name}
        </Heading>

        {section && (
          <Text as="p" fontSize={1} color="gray.600" mb={2}>
            Class: {section}
          </Text>
        )}

        <Text as="p" fontSize={2} color="gray.700" mb={2}>
          Form {formattedGrade}
        </Text>

        <Box mt="auto" pt={2}>
          <Flex justifyContent="flex-end" alignItems="center">
            <Box
              sx={{
                px: 2,
                py: 1,
                bg: "secondary",
                borderRadius: "999px",
                fontSize: "12px",
                color: "white",
              }}
            >
              View Details
            </Box>
          </Flex>
        </Box>
      </Box>
    </Link>
  );
};

export default SubjectClassCard;
