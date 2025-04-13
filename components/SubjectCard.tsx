import React from "react";
import { Box, Heading, Text } from "rebass";
import { Subject } from "@/types";
import Link from "next/link";

interface SubjectCardProps {
  subject: {
    id: string;
    name: string;
    code?: string;
    description?: string;
    courseCount: number;
    iconUrl?: string;
    headTeacher?: {
      _id: string;
      name: string;
      email: string;
    };
  };
  onClick?: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  const { id, name, code, description, courseCount, iconUrl, headTeacher } =
    subject;

  return (
    <Link href={`/subjects/${encodeURIComponent(id)}`} passHref>
      <Box
        as="div"
        onClick={onClick}
        sx={{
          p: 3,
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
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
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <Box sx={{ mb: 3 }}>
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={`${name} icon`}
              style={{ width: "48px", height: "48px" }}
            />
          ) : (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bg: "primary",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 3,
                fontWeight: "bold",
              }}
            >
              {name.charAt(0)}
            </Box>
          )}
        </Box>

        <Heading as="h3" fontSize={3} mb={2}>
          {name}
        </Heading>

        {code && (
          <Text as="p" fontSize={1} color="gray.600" mb={2}>
            Code: {code}
          </Text>
        )}

        {description && (
          <Text as="p" fontSize={2} color="gray.700" mb={3} flex="1">
            {description.length > 100
              ? `${description.substring(0, 100)}...`
              : description}
          </Text>
        )}

        {headTeacher && (
          <Text as="p" fontSize={1} color="gray.600" mb={2}>
            Head Teacher: {headTeacher.name}
          </Text>
        )}

        <Box mt="auto">
          <Text as="p" fontSize={1} color="primary" fontWeight="bold">
            {courseCount} Course{courseCount !== 1 ? "s" : ""}
          </Text>
        </Box>
      </Box>
    </Link>
  );
};

export default SubjectCard;
