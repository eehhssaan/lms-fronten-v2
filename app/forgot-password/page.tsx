"use client";

import { useState } from "react";
import { Box, Heading, Text } from "rebass";
import { Label, Input } from "@rebass/forms";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/ErrorMessage";
import { validateEmail } from "@/utils/helpers";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement password reset request API call
      // For now, just show success message
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.message || "Failed to process your request. Please try again."
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
            Check Your Email
          </Heading>
          <Text>
            If an account exists with the email you provided, you will receive
            password reset instructions.
          </Text>
          <Box mt={3}>
            <Box
              as="button"
              onClick={() => router.push("/auth")}
              className="btn btn-secondary"
            >
              Return to Login
            </Box>
          </Box>
        </Box>
      ) : (
        <>
          <Text mb={4}>
            Enter your email address and we'll send you instructions to reset
            your password.
          </Text>

          {error && <ErrorMessage message={error} />}

          <Box as="form" onSubmit={handleSubmit}>
            <Box mb={3}>
              <Label htmlFor="email" mb={2}>
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
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
                {loading ? "Processing..." : "Reset Password"}
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
