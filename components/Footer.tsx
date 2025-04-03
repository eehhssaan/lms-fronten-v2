import { Box, Flex, Text } from 'rebass';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      as="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'border',
        bg: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Flex
        flexDirection={['column', 'row']}
        justifyContent="space-between"
        alignItems={['center', 'flex-start']}
        className="container"
      >
        <Box mb={[3, 0]}>
          <Text fontSize={2} fontWeight="bold" mb={2}>
            Learning Management System
          </Text>
          <Text fontSize={1} color="secondary">
            © {currentYear} - All rights reserved
          </Text>
        </Box>
        
        <Flex
          flexDirection={['column', 'row']}
          alignItems={['center', 'flex-start']}
        >
          <Box mx={[0, 3]} mb={[2, 0]}>
            <Text fontWeight="bold" mb={2} fontSize={1}>
              Quick Links
            </Text>
            <Box as="ul" sx={{ listStyle: 'none', p: 0 }}>
              <Box as="li" mb={1}>
                <Link href="/" style={{ fontSize: '14px' }}>
                  Home
                </Link>
              </Box>
              <Box as="li" mb={1}>
                <Link href="/courses" style={{ fontSize: '14px' }}>
                  Courses
                </Link>
              </Box>
              <Box as="li">
                <Link href="/profile" style={{ fontSize: '14px' }}>
                  Profile
                </Link>
              </Box>
            </Box>
          </Box>
          
          <Box mx={[0, 3]}>
            <Text fontWeight="bold" mb={2} fontSize={1}>
              Help & Support
            </Text>
            <Box as="ul" sx={{ listStyle: 'none', p: 0 }}>
              <Box as="li" mb={1}>
                <Link href="#" style={{ fontSize: '14px' }}>
                  Contact Us
                </Link>
              </Box>
              <Box as="li" mb={1}>
                <Link href="#" style={{ fontSize: '14px' }}>
                  FAQs
                </Link>
              </Box>
              <Box as="li">
                <Link href="#" style={{ fontSize: '14px' }}>
                  Privacy Policy
                </Link>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
