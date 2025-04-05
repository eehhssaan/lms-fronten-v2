import { useState } from "react";
import Image from "next/image";
import { Box, Text } from "rebass";

interface ProfilePictureProps {
  src?: string;
  alt: string;
  size?: number;
  onUpload?: (file: File) => void;
  editable?: boolean;
}

export default function ProfilePicture({
  src,
  alt,
  size = 100,
  onUpload,
  editable = false,
}: ProfilePictureProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please upload a JPEG or PNG image");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    onUpload?.(file);
  };

  return (
    <Box position="relative">
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          bg: "gray.2",
          position: "relative",
        }}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bg: "primary",
              color: "white",
              fontSize: size / 3,
            }}
          >
            {alt.charAt(0).toUpperCase()}
          </Box>
        )}
      </Box>

      {editable && (
        <Box mt={2}>
          <Box
            as="label"
            htmlFor="profile-picture"
            sx={{
              cursor: "pointer",
              display: "inline-block",
              p: 2,
              bg: "primary",
              color: "white",
              borderRadius: 4,
              fontSize: 1,
            }}
          >
            Change Picture
            <Box
              as="input"
              type="file"
              id="profile-picture"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              sx={{ display: "none" }}
            />
          </Box>
        </Box>
      )}

      {error && (
        <Text color="red" fontSize={1} mt={2}>
          {error}
        </Text>
      )}
    </Box>
  );
}
