"use client";

import { useState } from "react";
import { Box, Flex, Text } from "rebass";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Box
      as="header"
      sx={{
        borderBottom: "1px solid",
        borderColor: "border",
        bg: "white",
      }}
    >
      <Flex
        px={3}
        py={3}
        alignItems="center"
        justifyContent="space-between"
        className="container"
        sx={{
          width: "100%",
          margin: "0 auto",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Flex alignItems="center">
            <Text fontSize={[3, 4]} fontWeight="bold" color="primary">
              LMS!
            </Text>
          </Flex>
        </Link>

        {/* Mobile menu button */}
        <Box
          sx={{
            display: ["block", "none"],
            cursor: "pointer",
          }}
          onClick={toggleMenu}
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </Box>

        {/* Desktop navigation */}
        <Box
          sx={{
            display: ["none", "block"],
          }}
        >
          <Navigation
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            user={user}
          />
        </Box>

        {/* User menu (desktop) */}
        {isAuthenticated && (
          <Flex
            alignItems="center"
            sx={{
              display: ["none", "flex"],
            }}
          >
            <Link href="/profile">
              <Box
                mr={3}
                sx={{
                  color: pathname === "/profile" ? "primary" : "text",
                  fontWeight: pathname === "/profile" ? "bold" : "normal",
                }}
              >
                {user?.name || "Profile"}
              </Box>
            </Link>
            <Box
              as="button"
              onClick={handleLogout}
              className="btn btn-secondary"
              sx={{
                py: 1,
                px: 2,
                fontSize: 1,
              }}
            >
              Logout
            </Box>
          </Flex>
        )}
      </Flex>

      {/* Mobile menu */}
      {menuOpen && (
        <Box
          sx={{
            display: ["block", "none"],
            borderTop: "1px solid",
            borderColor: "border",
          }}
        >
          <Box p={3}>
            <Navigation
              isAuthenticated={isAuthenticated}
              pathname={pathname}
              isMobile={true}
              closeMenu={() => setMenuOpen(false)}
              user={user}
            />

            {isAuthenticated && (
              <Box mt={3}>
                <Link href="/profile" onClick={() => setMenuOpen(false)}>
                  <Box
                    py={2}
                    sx={{
                      borderTop: "1px solid",
                      borderColor: "border",
                      color: pathname === "/profile" ? "primary" : "text",
                      fontWeight: pathname === "/profile" ? "bold" : "normal",
                    }}
                  >
                    Profile
                  </Box>
                </Link>
                <Box
                  as="button"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="btn btn-secondary"
                  mt={2}
                  width="100%"
                >
                  Logout
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
