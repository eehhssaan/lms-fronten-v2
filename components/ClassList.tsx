import { Box, Flex } from "rebass";
import ClassCard from "@/components/ClassCard";

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

interface ClassListProps {
  classes: Class[];
}

export default function ClassList({ classes }: ClassListProps) {
  return (
    <Box>
      <Flex mx={-2} flexWrap="wrap">
        {classes.map((classData) => (
          <Box
            key={classData._id}
            width={[1, 1 / 2, 1 / 3]}
            p={2}
            sx={{ height: "100%" }}
          >
            <ClassCard classData={classData} />
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
