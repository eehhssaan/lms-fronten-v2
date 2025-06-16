import React from "react";
import { Flex, Box } from "rebass";
import Link from "next/link";

interface CourseNavigationProps {
  courseId: string;
  activeTab: "content" | "assignments" | "students" | "presentations";
}

const CourseNavigation: React.FC<CourseNavigationProps> = ({
  courseId,
  activeTab,
}) => {
  const tabs = [
    { id: "content", label: "Content", href: `/courses/${courseId}` },
    {
      id: "assignments",
      label: "Assignments",
      href: `/courses/${courseId}/assignments`,
    },
    {
      id: "students",
      label: "Students",
      href: `/courses/${courseId}/students`,
    },
    {
      id: "presentations",
      label: "Presentations",
      href: `/courses/${courseId}/presentations`,
    },
    {
      id: "classes",
      label: "Classes",
      href: `/courses/${courseId}/classes`,
    },
    {
      id: "information",
      label: "Information",
      href: `/courses/${courseId}/information`,
    },
  ];

  return (
    <Flex
      as="nav"
      sx={{
        borderBottom: "1px solid",
        borderColor: "gray.2",
        mb: 4,
      }}
    >
      {tabs.map((tab) => (
        <Link key={tab.id} href={tab.href} style={{ textDecoration: "none" }}>
          <Box
            px={4}
            py={2}
            color={activeTab === tab.id ? "primary" : "gray.6"}
            sx={{
              borderBottom: activeTab === tab.id ? "2px solid" : "none",
              borderColor: "primary",
              cursor: "pointer",
              "&:hover": {
                color: "primary",
              },
            }}
          >
            {tab.label}
          </Box>
        </Link>
      ))}
    </Flex>
  );
};

export default CourseNavigation;
