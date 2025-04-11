import React from "react";
import { Box, Heading, Text } from "rebass";
import Link from "next/link";
import { FormLevel } from "@/types";

interface FormLevelCardProps {
  formLevel: {
    id: string;
    name: string;
    grade: string;
    courseCount: number;
  };
  subjectId: string;
  onClick?: () => void;
}

const FormLevelCard: React.FC<FormLevelCardProps> = ({
  formLevel,
  subjectId,
  onClick,
}) => {
  const { id, name, grade, courseCount } = formLevel;

  return (
    <Link
      href={`/subjects/${encodeURIComponent(
        subjectId
      )}/form-levels/${encodeURIComponent(id)}`}
      passHref
    >
      <Box
        as="div"
        onClick={onClick}
        sx={{
          p: 3,
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
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
            width: 40,
            height: 40,
            borderRadius: "8px",
            bg: "secondary",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 2,
            fontWeight: "bold",
            mb: 3,
          }}
        >
          {grade}
        </Box>

        <Heading as="h3" fontSize={3} mb={2}>
          {name}
        </Heading>

        <Box mt="auto" pt={2}>
          <Text as="p" fontSize={1} color="primary" fontWeight="bold">
            {courseCount} Course{courseCount !== 1 ? "s" : ""}
          </Text>
        </Box>
      </Box>
    </Link>
  );
};

export default FormLevelCard;
