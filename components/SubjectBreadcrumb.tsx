"use client";

import React from "react";
import { Box, Text } from "rebass";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface SubjectBreadcrumbProps {
  items: BreadcrumbItem[];
}

const SubjectBreadcrumb: React.FC<SubjectBreadcrumbProps> = ({ items }) => {
  return (
    <Box
      as="nav"
      aria-label="Breadcrumb"
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        mb: 4,
        fontSize: 1,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <Text
              as="span"
              sx={{
                mx: 2,
                color: "gray.500",
              }}
            >
              /
            </Text>
          )}

          {item.isActive ? (
            <Text
              as="span"
              sx={{
                color: "primary",
                fontWeight: "bold",
              }}
            >
              {item.label}
            </Text>
          ) : (
            <Link href={item.href} className="breadcrumb-link">
              <span
                style={{
                  color: "var(--colors-gray-700)",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--colors-primary)";
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--colors-gray-700)";
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                {item.label}
              </span>
            </Link>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

// Utility hook to generate breadcrumb items based on the current route
export const useSubjectBreadcrumb = (subjectName?: string) => {
  const params = useParams();
  const { subjectId, formLevelId, classId } = params;

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Subjects",
      href: "/subjects",
      isActive: !subjectId,
    },
  ];

  // Function to properly decode URL parameters that might be double-encoded
  const safelyDecode = (encodedValue: string) => {
    try {
      // First decode normally
      let decoded = decodeURIComponent(encodedValue);

      // Check if the result still has encoded characters (like %25)
      if (decoded.includes("%")) {
        decoded = decodeURIComponent(decoded);
      }

      return decoded;
    } catch (e) {
      // In case of invalid encoding, return as is
      return encodedValue;
    }
  };

  // Add subject breadcrumb if we have a subjectId
  if (subjectId) {
    breadcrumbItems.push({
      label:
        subjectName ||
        (typeof subjectId === "string" ? safelyDecode(subjectId) : "Subject"),
      href: `/subjects/${subjectId}`,
      isActive: !!subjectId && !formLevelId,
    });
  }

  // Add form level breadcrumb if we have a formLevelId
  if (subjectId && formLevelId) {
    // Extract just the number from "Form X" if present
    const formLevelLabel =
      typeof formLevelId === "string" ? safelyDecode(formLevelId) : "";

    // Remove any "Form " prefix if it exists to avoid duplication
    const cleanedFormLevel = formLevelLabel.replace(/^Form\s+/i, "");

    breadcrumbItems.push({
      label: `Form ${cleanedFormLevel}`,
      href: `/subjects/${subjectId}/form-levels/${formLevelId}`,
      isActive: !!formLevelId && !classId,
    });
  }

  // Add class breadcrumb if we have a classId
  if (subjectId && formLevelId && classId) {
    // For class ID, we need to determine if it's a MongoDB ID or a class name
    const decodedClassId =
      typeof classId === "string" ? safelyDecode(classId) : "";

    // If it's a MongoDB ID (looks like a hex string), use a generic label
    const isMongoId = /^[0-9a-f]{24}$/i.test(decodedClassId);
    const classLabel = isMongoId ? "Class" : decodedClassId;

    breadcrumbItems.push({
      label: classLabel,
      href: `/subjects/${subjectId}/form-levels/${formLevelId}/classes/${classId}`,
      isActive: !!classId,
    });
  }

  return breadcrumbItems;
};

export default SubjectBreadcrumb;
