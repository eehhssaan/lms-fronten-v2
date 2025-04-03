import { Box, Flex } from 'rebass';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types';

interface CourseListProps {
  courses: Course[];
  showEnrollmentStatus?: boolean;
}

export default function CourseList({ courses, showEnrollmentStatus = false }: CourseListProps) {
  return (
    <Box>
      <Flex mx={-2} flexWrap="wrap">
        {courses.map((course) => (
          <Box 
            key={course._id} 
            width={[1, 1/2, 1/3]} 
            p={2}
            sx={{ height: '100%' }}
          >
            <CourseCard 
              course={course} 
              showEnrollmentStatus={showEnrollmentStatus} 
            />
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
