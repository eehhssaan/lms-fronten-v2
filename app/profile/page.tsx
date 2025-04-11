"use client";

import { useState, useEffect } from "react";
import { Box, Flex, Heading, Text } from "rebass";
import { Label, Input, Textarea } from "@rebass/forms";
import { useAuth } from "@/context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  getStudentCourses,
  getTeachingCourses,
  updateUserPassword,
} from "@/lib/api";
import ErrorMessage from "@/components/ErrorMessage";
import Image from "next/image";
import { User } from "@/types";
import ProfilePicture from "@/components/ProfilePicture";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    grade: "",
    gender: "",
    bio: "",
    contactNumber: "",
    preferredLanguage: "english",
    dateOfBirth: "",
    school: "",
    profilePicture: null as File | null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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
        gender: userData.gender || "",
        bio: userData.bio || "",
        contactNumber: userData.contactNumber || "",
        preferredLanguage: userData.preferredLanguage || "english",
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
          : "",
        school: userData.school || "",
        profilePicture: null,
      });

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
      // Create an object with the form data, excluding empty values
      const updateData: Parameters<typeof updateUserProfile>[0] = {
        name: formData.name || undefined,
        school: formData.school || undefined,
        grade: formData.grade || undefined,
        gender: formData.gender as "male" | "female" | "other" | undefined,
        bio: formData.bio || undefined,
        contactNumber: formData.contactNumber || undefined,
        preferredLanguage: formData.preferredLanguage as
          | "english"
          | "cantonese"
          | "mandarin"
          | undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        profilePicture: formData.profilePicture || undefined,
      };

      const updatedUser = await updateUserProfile(updateData);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await updateUserPassword(passwordData);
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
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

                <Box mb={3}>
                  <Label htmlFor="school">School/Institution</Label>
                  <Input
                    id="school"
                    name="school"
                    value={formData.school}
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

                <Box mb={3}>
                  <Label htmlFor="gender">Gender</Label>
                  <Box
                    as="select"
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    sx={{
                      display: "block",
                      width: "100%",
                      p: 2,
                      appearance: "none",
                      fontSize: "inherit",
                      lineHeight: "inherit",
                      border: "1px solid",
                      borderColor: "gray.2",
                      borderRadius: 4,
                      bg: "white",
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Box>
                </Box>

                <Box mb={3}>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </Box>

                <Box mb={3}>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                  />
                </Box>

                <Box mb={3}>
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Box
                    as="select"
                    id="preferredLanguage"
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                    sx={{
                      display: "block",
                      width: "100%",
                      p: 2,
                      appearance: "none",
                      fontSize: "inherit",
                      lineHeight: "inherit",
                      border: "1px solid",
                      borderColor: "gray.2",
                      borderRadius: 4,
                      bg: "white",
                    }}
                  >
                    <option value="english">English</option>
                    <option value="cantonese">Cantonese</option>
                    <option value="mandarin">Mandarin</option>
                  </Box>
                </Box>

                <Box mb={3}>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                  />
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
              <>
                <Box mb={4}>
                  <Text color="gray.6" mb={1}>
                    School/Institution
                  </Text>
                  <Text>{user.school || "Not specified"}</Text>
                </Box>

                <Box mb={4}>
                  <Text color="gray.6" mb={1}>
                    Gender
                  </Text>
                  <Text>
                    {user.gender
                      ? user.gender.charAt(0).toUpperCase() +
                        user.gender.slice(1)
                      : "Not specified"}
                  </Text>
                </Box>

                <Box mb={4}>
                  <Text color="gray.6" mb={1}>
                    Date of Birth
                  </Text>
                  <Text>
                    {user.dateOfBirth
                      ? new Date(user.dateOfBirth).toLocaleDateString()
                      : "Not specified"}
                  </Text>
                </Box>

                <Box mb={4}>
                  <Text color="gray.6" mb={1}>
                    Contact Number
                  </Text>
                  <Text>{user.contactNumber || "Not specified"}</Text>
                </Box>

                <Box mb={4}>
                  <Text color="gray.6" mb={1}>
                    Preferred Language
                  </Text>
                  <Text>
                    {user.preferredLanguage
                      ? user.preferredLanguage.charAt(0).toUpperCase() +
                        user.preferredLanguage.slice(1)
                      : "English"}
                  </Text>
                </Box>

                <Box mb={4}>
                  <Text color="gray.6" mb={1}>
                    Bio
                  </Text>
                  <Text>{user.bio || "No bio provided"}</Text>
                </Box>

                <Box
                  as="button"
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Box>
              </>
            )}
          </Box>

          {/* Password Change Section */}
          <Box className="card" p={4} mb={4}>
            <Heading as="h3" fontSize={3} mb={3}>
              Change Password
            </Heading>
            {passwordError && <ErrorMessage message={passwordError} />}
            {passwordSuccess && (
              <Box
                p={3}
                bg="green"
                color="white"
                sx={{ borderRadius: "4px" }}
                mb={3}
              >
                <Text fontWeight="bold">Password updated successfully!</Text>
              </Box>
            )}
            <Box as="form" onSubmit={handlePasswordSubmit}>
              <Box mb={3}>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Box>
              <Box mb={3}>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Box>
              <Box>
                <Box
                  as="button"
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Updating Password..." : "Update Password"}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Role-specific information */}
          {user.role === "student" && (
            <Box className="card" p={4}>
              <Heading as="h3" fontSize={2} mb={3}>
                Course Progress
              </Heading>
              <Text color="gray.6">
                Course progress information will be displayed here.
              </Text>
            </Box>
          )}

          {user.role === "teacher" && (
            <Box className="card" p={4}>
              <Heading as="h3" fontSize={2} mb={3}>
                Teaching Overview
              </Heading>
              <Text color="gray.6">
                Teaching information will be displayed here.
              </Text>
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
                    Grade
                  </Box>
                  <Box as="dd" mb={2}>
                    {user.grade}
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
