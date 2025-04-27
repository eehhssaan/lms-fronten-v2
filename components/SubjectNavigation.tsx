import { Box, Flex } from "rebass";
import { useRouter } from "next/navigation";

interface SubjectNavigationProps {
  subjectId: string;
  activeTab: "chapters" | "content" | "courses" | "information";
}

export default function SubjectNavigation({
  subjectId,
  activeTab,
}: SubjectNavigationProps) {
  const router = useRouter();

  const tabs = [
    {
      id: "chapters",
      label: "Chapters",
      href: `/subjects/${subjectId}/chapters`,
    },
    {
      id: "content",
      label: "Content",
      href: `/subjects/${subjectId}`,
    },
    {
      id: "courses",
      label: "Courses",
      href: `/subjects/${subjectId}/courses`,
    },
    {
      id: "information",
      label: "Information",
      href: `/subjects/${subjectId}/information`,
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
