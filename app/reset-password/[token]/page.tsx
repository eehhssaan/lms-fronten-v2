"use client";

import { useState } from "react";
import { Box, Heading, Text } from "rebass";
import { Label, Input } from "@rebass/forms";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/ErrorMessage";
import { validatePassword } from "@/utils/helpers";
import { resetPassword } from "@/lib/api";

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.message || "Failed to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "500px",
        mx: "auto",
        px: 3,
        py: 4,
      }}
    >
      <Heading as="h1" mb={4}>
        Reset Your Password
      </Heading>

      {success ? (
        <Box p={3} bg="green" color="white" sx={{ borderRadius: "4px" }}>
          <Heading as="h3" fontSize={2} mb={2}>
            Password Reset Successful
          </Heading>
          <Text>Your password has been successfully reset.</Text>
          <Box mt={3}>
            <Box
              as="button"
              onClick={() => router.push("/auth")}
              className="btn btn-secondary"
            >
              Go to Login
            </Box>
          </Box>
        </Box>
      ) : (
        <>
          <Text mb={4}>Enter your new password below.</Text>

          {error && <ErrorMessage message={error} />}

          <Box as="form" onSubmit={handleSubmit}>
            <Box mb={3}>
              <Label htmlFor="password" mb={2}>
                New Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                className="form-input"
              />
            </Box>

            <Box mb={3}>
              <Label htmlFor="confirmPassword" mb={2}>
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                required
                className="form-input"
              />
            </Box>

            <Box mb={3}>
              <Box
                as="button"
                type="submit"
                className="btn btn-primary"
                width="100%"
                disabled={loading}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Box>
            </Box>

            <Box textAlign="center">
              <Text
                as="a"
                href="/auth"
                color="primary"
                sx={{
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Back to Login
              </Text>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
