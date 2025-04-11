/**
 * Authentication API Test Utility
 *
 * This script helps test the authentication API responses and our frontend's handling of them.
 * It can be run in Node.js or copied into browser console for client-side testing.
 *
 * Usage:
 * 1. Run via Node: node test-auth-api.js
 * 2. Or in browser console at http://localhost:3000
 */

// Configuration
const API_BASE_URL = "http://localhost:8000";
let authToken = null;

// API test functions
async function testLogin(email, password) {
  try {
    console.log(`🔑 Testing login with email: ${email}`);

    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email || "test@example.com",
        password: password || "password123",
      }),
    });

    const data = await response.json();
    console.log("📥 Original API response:", data);

    // Store token for subsequent requests
    if (data.token) {
      authToken = data.token;
      console.log("🔐 Token received and stored for subsequent requests");
    }

    // Analyze response format
    console.log("\n📊 Response Format Analysis:");
    if (data.success) {
      console.log("✅ Success flag present");
    } else {
      console.log("⚠️ Success flag missing or false");
    }

    if (data.token) {
      console.log("✅ Token present");
    } else {
      console.log("⚠️ No token in response");
    }

    if (data.data) {
      console.log('✅ User data in "data" property (API spec format)');
      validateUserData(data.data);
    } else if (data.user) {
      console.log('⚠️ User data in "user" property (non-standard format)');
      validateUserData(data.user);
    } else {
      console.log("❌ No user data found in response");
    }

    // Transform to expected format for frontend
    const transformedData = transformResponse(data);
    console.log("\n🔄 Transformed response for frontend:", transformedData);

    return {
      originalResponse: data,
      transformedResponse: transformedData,
    };
  } catch (error) {
    console.error("❌ Login test failed:", error);
    return { error: error.message };
  }
}

async function testRegister(name, email, password) {
  try {
    console.log(`👤 Testing registration with email: ${email}`);

    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name || "Test User",
        email: email || `test${Date.now()}@example.com`,
        password: password || "password123",
      }),
    });

    const data = await response.json();
    console.log("📥 Original API response:", data);

    // Store token for subsequent requests
    if (data.token) {
      authToken = data.token;
      console.log("🔐 Token received and stored for subsequent requests");
    }

    // Analyze and transform response
    const transformedData = transformResponse(data);
    console.log("🔄 Transformed response for frontend:", transformedData);

    return {
      originalResponse: data,
      transformedResponse: transformedData,
    };
  } catch (error) {
    console.error("❌ Registration test failed:", error);
    return { error: error.message };
  }
}

async function testGetCurrentUser() {
  try {
    if (!authToken) {
      console.error(
        "❌ No auth token available. Please login or register first."
      );
      return { error: "No auth token available" };
    }

    console.log("👤 Testing get current user API");

    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("📥 Original API response:", data);

    // Analyze response format
    if (data.data) {
      console.log('✅ User data in "data" property (API spec format)');
      validateUserData(data.data);
    } else if (data.user) {
      console.log('⚠️ User data in "user" property (non-standard format)');
      validateUserData(data.user);
    } else if (data._id || data.id) {
      console.log("⚠️ User data directly in response object");
      validateUserData(data);
    } else {
      console.log("❌ No user data found in response");
    }

    // Transform to expected format for frontend
    const transformedData = transformUserData(
      data.data || data.user || (data._id || data.id ? data : null)
    );
    console.log("🔄 Transformed user data for frontend:", transformedData);

    return {
      originalResponse: data,
      transformedData: transformedData,
    };
  } catch (error) {
    console.error("❌ Get current user test failed:", error);
    return { error: error.message };
  }
}

// Helper functions
function validateUserData(userData) {
  if (!userData) {
    console.log("❌ User data is null or undefined");
    return false;
  }

  console.log("\n🔍 User Data Validation:");
  const requiredFields = ["name", "email", "role"];
  const idField = userData.id || userData._id;

  if (!idField) {
    console.log("❌ Missing required ID field (id or _id)");
  } else {
    console.log(
      `✅ User ID present: ${idField} (as ${userData.id ? "id" : "_id"})`
    );
  }

  for (const field of requiredFields) {
    if (userData[field]) {
      console.log(`✅ ${field}: ${userData[field]}`);
    } else {
      console.log(`❌ Missing required field: ${field}`);
    }
  }

  // Log all available fields for reference
  console.log("\n📋 All available user fields:");
  Object.keys(userData).forEach((key) => {
    const value =
      typeof userData[key] === "object" ? "[Object]" : userData[key];
    console.log(`   ${key}: ${value}`);
  });

  return true;
}

function transformResponse(apiResponse) {
  // If response is already in correct format, return as is
  if (apiResponse.success && apiResponse.token && apiResponse.data) {
    return apiResponse;
  }

  // Construct our standardized response
  const result = {
    success: apiResponse.success !== undefined ? apiResponse.success : true,
    token: apiResponse.token || null,
  };

  // Transform user data
  if (apiResponse.data) {
    result.data = transformUserData(apiResponse.data);
  } else if (apiResponse.user) {
    result.data = transformUserData(apiResponse.user);
  } else if (apiResponse._id || apiResponse.id) {
    // Direct user data in response
    result.data = transformUserData(apiResponse);
  } else {
    result.data = null;
    result.error = "No user data found in response";
  }

  return result;
}

function transformUserData(userData) {
  if (!userData) return null;

  // Create base user object with required fields
  const transformedUser = {
    id: userData.id || userData._id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };

  // Add optional fields if present
  const optionalFields = [
    "profilePicture",
    "school",
    "grade",
    "gender",
    "bio",
    "contactNumber",
    "preferredLanguage",
    "dateOfBirth",
    "createdAt",
    "updatedAt",
  ];

  optionalFields.forEach((field) => {
    if (userData[field] !== undefined) {
      transformedUser[field] = userData[field];
    }
  });

  // Add isActive field, handling both active and isActive properties
  transformedUser.isActive =
    userData.isActive !== undefined
      ? userData.isActive
      : userData.active !== undefined
      ? userData.active
      : true;

  // Preserve original fields for compatibility
  if (userData._id) transformedUser._id = userData._id;
  if (userData.active !== undefined) transformedUser.active = userData.active;
  if (userData.__v !== undefined) transformedUser.__v = userData.__v;

  return transformedUser;
}

// Simple test runner
async function runAllTests(email, password) {
  console.log("🚀 Starting auth API tests...\n");

  // Test login flow
  const loginResult = await testLogin(email, password);
  console.log("\n-----------------------------------\n");

  // Test get current user flow with token from login
  if (authToken) {
    const userResult = await testGetCurrentUser();
    console.log("\n-----------------------------------\n");
  }

  // Test register flow with random email
  const randomEmail = `test${Date.now()}@example.com`;
  const registerResult = await testRegister(
    "Test User",
    randomEmail,
    "password123"
  );

  console.log("\n✅ All tests completed!");
  return {
    login: loginResult,
    currentUser: authToken ? await testGetCurrentUser() : null,
    register: registerResult,
  };
}

// For Node.js environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    testLogin,
    testRegister,
    testGetCurrentUser,
    runAllTests,
  };

  // Auto-run if called directly
  if (require.main === module) {
    // Get credentials from command line args
    const email = process.argv[2];
    const password = process.argv[3];

    if (email && password) {
      runAllTests(email, password);
    } else {
      console.log("Usage: node test-auth-api.js <email> <password>");
      console.log(
        "Example: node test-auth-api.js test@example.com password123"
      );
    }
  }
}

// For browser environment
if (typeof window !== "undefined") {
  window.authApiTests = {
    testLogin,
    testRegister,
    testGetCurrentUser,
    runAllTests,
  };

  console.log("Auth API test utilities loaded into window.authApiTests");
  console.log(
    'Run tests with: authApiTests.runAllTests("your@email.com", "password")'
  );
}
