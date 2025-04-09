import { Box, Flex } from "rebass";
import { useRouter } from "next/navigation";

interface CourseNavigationProps {
  courseId: string;
  activeTab: "content" | "assignments" | "information";
}

export default function CourseNavigation({
  courseId,
  activeTab,
}: CourseNavigationProps) {
  const router = useRouter();

  const tabs = [
    {
      id: "content",
      label: "Content",
      href: `/courses/${courseId}`,
    },
    {
      id: "assignments",
      label: "Assignments",
      href: `/assignments?courseId=${courseId}`,
    },
    {
      id: "information",
      label: "Information",
      href: `/courses/${courseId}/information`,
    },
  ];

  return (
    <Flex mb={4} sx={{ borderBottom: "1px solid", borderColor: "gray.2" }}>
      {tabs.map((tab) => (
        <Box
          key={tab.id}
          as="button"
          onClick={() => router.push(tab.href)}
          sx={{
            py: 2,
            px: 4,
            bg: "transparent",
            border: "none",
            borderBottom: activeTab === tab.id ? "2px solid" : "none",
            borderColor: "primary",
            color: activeTab === tab.id ? "primary" : "inherit",
            cursor: "pointer",
            fontWeight: activeTab === tab.id ? "bold" : "normal",
            "&:hover": {
              color: "primary",
            },
          }}
        >
          {tab.label}
        </Box>
      ))}
    </Flex>
  );
}
