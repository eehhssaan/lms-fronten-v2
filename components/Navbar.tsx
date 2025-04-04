import Link from "next/link";
import { Box, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import Button from "./Button";

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  // Debug log
  console.log("Navbar Auth State:", {
    isAuthenticated,
    userRole: user?.role,
    userName: user?.name,
    loading,
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <Box
      as="nav"
      sx={{
        backgroundColor: "primary",
        padding: 3,
      }}
    >
      <Flex
        className="container"
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex alignItems="center" sx={{ gap: 4 }}>
          <Link href="/" passHref>
            <Text
              as="a"
              sx={{
                color: "white",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: 3,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              LMS
            </Text>
          </Link>

          {/* Show navigation links only when authentication is confirmed */}
          {!loading && isAuthenticated && (
            <>
              {/* Courses link - visible to all authenticated users */}
              <Link href="/courses" passHref>
                <Text
                  as="a"
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Courses
                </Text>
              </Link>

              {/* Classes link - only for teachers and admins */}
              {user?.role && ["teacher", "admin"].includes(user.role) && (
                <Link href="/classes" passHref>
                  <Text
                    as="a"
                    sx={{
                      color: "white",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Classes
                  </Text>
                </Link>
              )}
            </>
          )}
        </Flex>

        <Flex alignItems="center" sx={{ gap: 3 }}>
          {!loading &&
            (isAuthenticated ? (
              <>
                <Text color="white">
                  Welcome, {user?.name} ({user?.role})
                </Text>
                <Button onClick={handleLogout} variant="secondary" size="small">
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth" passHref>
                <Button as="a" variant="secondary" size="small">
                  Login
                </Button>
              </Link>
            ))}
        </Flex>
      </Flex>
    </Box>
  );
}

{
  /* Show Create Course link for teachers and admins */
}
