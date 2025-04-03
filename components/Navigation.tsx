import { Box, Flex } from 'rebass';
import Link from 'next/link';

interface NavigationProps {
  isAuthenticated: boolean;
  pathname: string;
  isMobile?: boolean;
  closeMenu?: () => void;
}

export default function Navigation({ 
  isAuthenticated, 
  pathname,
  isMobile = false,
  closeMenu
}: NavigationProps) {
  const handleClick = () => {
    if (isMobile && closeMenu) {
      closeMenu();
    }
  };

  const navItems = isAuthenticated 
    ? [
        { path: '/', label: 'Home' },
        { path: '/courses', label: 'Courses' },
      ]
    : [
        { path: '/auth', label: 'Login / Register' },
      ];

  return (
    <Flex
      as="nav"
      sx={{
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {navItems.map((item) => (
        <Box 
          key={item.path}
          mx={isMobile ? 0 : 3}
          mb={isMobile ? 2 : 0}
        >
          <Link href={item.path} onClick={handleClick}>
            <Box
              sx={{
                py: isMobile ? 2 : 0,
                borderBottom: isMobile && pathname !== item.path ? '1px solid' : 'none',
                borderColor: 'border',
                color: pathname === item.path ? 'primary' : 'text',
                fontWeight: pathname === item.path ? 'bold' : 'normal',
              }}
            >
              {item.label}
            </Box>
          </Link>
        </Box>
      ))}
    </Flex>
  );
}
