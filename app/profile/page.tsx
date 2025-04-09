"use client";

import { useState, useEffect } from "react";
import { Box, Flex, Heading, Text } from "rebass";
import { Label, Input } from "@rebass/forms";
import { useAuth } from "@/context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  getStudentProgress,
  getStudentCourses,
  getTeachingCourses,
} from "@/lib/api";
import ErrorMessage from "@/components/ErrorMessage";
import Image from "next/image";
import { User, StudentProgress } from "@/types";
import ProfilePicture from "@/components/ProfilePicture";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentProgress, setStudentProgress] =
    useState<StudentProgress | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    grade: "",
    subject: "",
    profilePicture: null as File | null,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUserProfile();
      setUser(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        currentPassword: "",
        newPassword: "",
        grade: userData.grade || "",
        subject: userData.subject || "",
        profilePicture: null,
      });

      if (userData.role === "student") {
        const progress = await getStudentProgress();
        setStudentProgress(progress);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture" && files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      const updatedUser = await updateUserProfile(formDataToSend);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box p={4}>Loading...</Box>;
  if (!user) return <Box p={4}>No user data found</Box>;

  return (
    <Box as="div" className="container" py={4}>
      <Heading mb={4}>Profile</Heading>
      {error && <ErrorMessage message={error} />}

      <Flex flexWrap="wrap" mx={-2}>
        {/* Profile Information */}
        <Box width={[1, 2 / 3]} px={2}>
          <Box className="card" p={4} mb={4}>
            <Flex alignItems="center" mb={4}>
              <Box mr={3}>
                <ProfilePicture
                  src={user.profilePicture}
                  alt={user.name}
                  size={100}
                  editable={isEditing}
                  onUpload={(file) => {
                    setFormData((prev) => ({
                      ...prev,
                      profilePicture: file,
                    }));
                  }}
                />
              </Box>
              <Box>
                <Heading as="h2" fontSize={3}>
                  {user.name}
                </Heading>
                <Text color="gray.6">{user.email}</Text>
                <Text mt={2} color="primary">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
              </Box>
            </Flex>

            {isEditing ? (
              <Box as="form" onSubmit={handleSubmit}>
                <Box mb={3}>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Box>

                <Box mb={3}>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Box>

                {user.role === "student" && (
                  <Box mb={3}>
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                    />
                  </Box>
                )}

                {user.role === "teacher" && (
                  <Box mb={3}>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                    />
                  </Box>
                )}

                <Box mb={3}>
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <Input
                    id="profilePicture"
                    name="profilePicture"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleInputChange}
                  />
                  <Text fontSize={1} color="gray.6" mt={1}>
                    Max size: 2MB. Allowed types: JPEG, PNG
                  </Text>
                </Box>

                <Box mb={3}>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </Box>

                <Box mb={3}>
                  <Label htmlFor="newPassword">New Password (optional)</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </Box>

                <Flex>
                  <Box
                    as="button"
                    type="submit"
                    className="btn btn-primary"
                    mr={2}
                  >
                    Save Changes
                  </Box>
                  <Box
                    as="button"
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Box>
                </Flex>
              </Box>
            ) : (
              <Box
                as="button"
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Box>
            )}
          </Box>

          {/* Role-specific information */}
          {user.role === "student" && studentProgress && (
            <Box className="card" p={4}>
              <Heading as="h3" fontSize={2} mb={3}>
                Academic Progress
              </Heading>
              <Box mb={4}>
                <Text fontWeight="bold">Overall Completion Rate</Text>
                <Text>{studentProgress.overall.completionRate}%</Text>
                <Text fontWeight="bold" mt={2}>
                  Average Score
                </Text>
                <Text>{studentProgress.overall.averageScore}%</Text>
              </Box>

              <Heading as="h4" fontSize={2} mb={3}>
                Course Progress
              </Heading>
              {studentProgress.courses.map((course) => (
                <Box key={course.courseId} mb={3} p={3} bg="gray.0">
                  <Text fontWeight="bold">{course.title}</Text>
                  <Text>Progress: {course.progress}%</Text>
                  <Text>
                    Assignments: {course.assignments.completed}/
                    {course.assignments.total}
                  </Text>
                  <Text>
                    Quizzes: {course.quizzes.completed}/{course.quizzes.total}
                  </Text>
                </Box>
              ))}
            </Box>
          )}

          {user.role === "teacher" && user.teachingCourses && (
            <Box className="card" p={4}>
              <Heading as="h3" fontSize={2} mb={3}>
                Teaching Overview
              </Heading>
              {user.teachingCourses.map((course) => (
                <Box key={course._id} mb={3} p={3} bg="gray.0">
                  <Text fontWeight="bold">{course.title}</Text>
                  <Text>Course Code: {course.code}</Text>
                  <Text>Students: {course.studentCount}</Text>
                  <Text>Pending Assignments: {course.pendingAssignments}</Text>
                  <Text>Pending Quizzes: {course.pendingQuizzes}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Account Details */}
        <Box width={[1, 1 / 3]} px={2}>
          <Box className="card" p={4}>
            <Heading as="h3" fontSize={2} mb={3}>
              Account Details
            </Heading>
            <Box as="dl">
              <Box as="dt" fontWeight="bold">
                Role
              </Box>
              <Box as="dd" mb={2}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Box>

              {user.role === "student" && (
                <>
                  <Box as="dt" fontWeight="bold">
                    Student ID
                  </Box>
                  <Box as="dd" mb={2}>
                    {user.studentId}
                  </Box>
                  <Box as="dt" fontWeight="bold">
                    Grade
                  </Box>
                  <Box as="dd" mb={2}>
                    {user.grade}
                  </Box>
                </>
              )}

              {user.role === "teacher" && (
                <>
                  <Box as="dt" fontWeight="bold">
                    Subject
                  </Box>
                  <Box as="dd" mb={2}>
                    {user.subject}
                  </Box>
                </>
              )}

              <Box as="dt" fontWeight="bold">
                Account Created
              </Box>
              <Box as="dd" mb={2}>
                {new Date(user.createdAt || "").toLocaleDateString()}
              </Box>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
