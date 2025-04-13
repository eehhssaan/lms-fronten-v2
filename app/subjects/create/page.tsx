"use client";

import React, { useState, useEffect } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Input, Label, Textarea, Select } from "@rebass/forms";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import SubjectBreadcrumb, {
  useSubjectBreadcrumb,
} from "@/components/SubjectBreadcrumb";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import { createSubject } from "@/lib/api";

export default function CreateSubjectPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    headTeacher: "",
    iconUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Add subject creation to breadcrumb
  const baseBreadcrumbItems = useSubjectBreadcrumb();
  const breadcrumbItems = [
    ...baseBreadcrumbItems,
    { label: "Create Subject", href: "/subjects/create" },
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  // Only admin users can access this page
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      router.push("/subjects");
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError("Subject name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createSubject({
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
        headTeacher: formData.headTeacher || undefined,
        iconUrl: formData.iconUrl || undefined,
      });

      setSuccess(true);

      // Reset form
      setFormData({
        name: "",
        code: "",
        description: "",
        headTeacher: "",
        iconUrl: "",
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/subjects");
      }, 2000);
    } catch (err: any) {
      console.error("Failed to create subject:", err);
      setError(err.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null; // Will redirect
  }

  return (
    <Box as="div" className="container" py={4} px={[3, 4]}>
      <SubjectBreadcrumb items={breadcrumbItems} />

      <Heading as="h1" fontSize={[4, 5]} mb={4}>
        Create New Subject
      </Heading>

      {error && <ErrorMessage message={error} />}

      {success && (
        <Box p={3} bg="success" color="white" borderRadius="md" mb={4}>
          <Text fontWeight="bold">Subject created successfully!</Text>
          <Text>Redirecting to subjects page...</Text>
        </Box>
      )}

      <Box
        as="form"
        onSubmit={handleSubmit}
        p={4}
        bg="white"
        borderRadius="md"
        boxShadow="sm"
      >
        <Box mb={3}>
          <Label htmlFor="name" mb={2}>
            Subject Name*
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </Box>

        <Box mb={3}>
          <Label htmlFor="code" mb={2}>
            Subject Code
          </Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
          />
        </Box>

        <Box mb={3}>
          <Label htmlFor="description" mb={2}>
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
          />
        </Box>

        <Box mb={3}>
          <Label htmlFor="headTeacher" mb={2}>
            Head Teacher ID
          </Label>
          <Input
            id="headTeacher"
            name="headTeacher"
            value={formData.headTeacher}
            onChange={handleInputChange}
            placeholder="Enter teacher ID to assign as head teacher"
          />
          <Text fontSize={1} color="gray.600" mt={1}>
            Enter the ID of a teacher to assign them as the head teacher for
            this subject
          </Text>
        </Box>

        <Box mb={4}>
          <Label htmlFor="iconUrl" mb={2}>
            Icon URL
          </Label>
          <Input
            id="iconUrl"
            name="iconUrl"
            value={formData.iconUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/icon.png"
          />
        </Box>

        <Flex justifyContent="flex-end">
          <Button
            onClick={() => router.push("/subjects")}
            variant="secondary"
            sx={{ marginRight: 3 }}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Creating..." : "Create Subject"}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
