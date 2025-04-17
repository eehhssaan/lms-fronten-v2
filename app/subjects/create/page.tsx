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
    grade: "",
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
    { label: "Create Subject2", href: "/subjects/create" },
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

    if (
      !formData.name ||
      !formData.code ||
      !formData.grade ||
      !formData.headTeacher
    ) {
      setError(
        "Please fill in all required fields (Name, Code, Grade Level, and Head Teacher)"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createSubject({
        name: formData.name,
        code: formData.code,
        grade: formData.grade,
        description: formData.description || undefined,
        headTeacher: formData.headTeacher,
        iconUrl: formData.iconUrl || undefined,
      });

      setSuccess(true);

      // Reset form
      setFormData({
        name: "",
        code: "",
        grade: "",
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
            Subject Name* (Required)
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter subject name"
          />
        </Box>

        <Box mb={3}>
          <Label htmlFor="code" mb={2}>
            Subject Code* (Required)
          </Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            required
            placeholder="Enter unique subject code"
          />
        </Box>

        <Box mb={3}>
          <Label htmlFor="grade" mb={2}>
            Grade Level* (Required)
          </Label>
          <Select
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Grade Level</option>
            <option value="1">Form 1</option>
            <option value="2">Form 2</option>
            <option value="3">Form 3</option>
            <option value="4">Form 4</option>
            <option value="5">Form 5</option>
            <option value="6">Form 6</option>
          </Select>
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
            Head Teacher ID* (Required)
          </Label>
          <Input
            id="headTeacher"
            name="headTeacher"
            value={formData.headTeacher}
            onChange={handleInputChange}
            required
            placeholder="Enter teacher ID to assign as head teacher"
          />
          <Text fontSize={1} color="gray.600" mt={1}>
            Enter the ID of an existing teacher to assign them as the head
            teacher
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
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? "#ccc" : "#0066cc",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
            }}
          >
            {loading ? "Creating..." : "Create Subject3"}
          </button>
        </Flex>
      </Box>
    </Box>
  );
}
