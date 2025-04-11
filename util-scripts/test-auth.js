// Login API Test Utility
// This script specifically tests the backend API response format for login
// and shows how our frontend processes it
// Run with: node test-auth.js
// Or in the browser console

/**
 * Test the login API and diagnose response format issues
 */
async function testLogin(
  email = "ehsan2@gmail.com",
  password = "your-password-here"
) {
  try {
    console.log("🔑 Testing login with email:", email);
    console.log("📋 Step 1: Making direct API request to backend...");

    // 1. Make the raw API request
    const response = await fetch("http://localhost:8000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    // 2. Get and analyze the raw response
    const data = await response.json();
    console.log("📥 Backend API Response:", JSON.stringify(data, null, 2));

    // 3. Check for critical fields
    console.log("\n📊 Response Format Analysis:");

    // Check success flag
    if (data.success === true) {
      console.log("✅ Success flag is TRUE");
    } else if (data.success === false) {
      console.log("❌ Success flag is FALSE - Authentication failed");
      console.log("   Message:", data.message || "No error message provided");
      return { error: "Authentication failed", data };
    } else {
      console.log("⚠️ Success flag is MISSING");
    }

    // Check token
    if (data.token) {
      console.log("✅ Token is present");
    } else {
      console.log("❌ Token is MISSING - Critical error");
    }

    // Check user data location
    let userData = null;
    if (data.data) {
      console.log("✅ User data in 'data' property (API spec format)");
      userData = data.data;
    } else if (data.user) {
      console.log("⚠️ User data in 'user' property (non-standard format)");
      userData = data.user;
    } else {
      console.log("❌ No user data found in response");
    }

    // 4. Simulate our frontend processing
    console.log("\n🔄 Simulating frontend processing of response...");

    // Transform to expected frontend format
    let transformedData;
    try {
      transformedData = {
        token: data.token,
        data: userData
          ? {
              id: userData._id || userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              profilePicture: userData.profilePicture,
              isActive: userData.active !== undefined ? userData.active : true,
              // Preserve original fields for compatibility
              _id: userData._id,
              active: userData.active,
            }
          : null,
      };

      console.log("✅ Frontend transformation successful");
      console.log(
        "🔍 Transformed data:",
        JSON.stringify(transformedData, null, 2)
      );

      if (transformedData.data && transformedData.token) {
        console.log(
          "✅ RESULT: Login would be SUCCESSFUL with our updated code"
        );
      } else {
        console.log("❌ RESULT: Login would still FAIL with our updated code");
      }
    } catch (error) {
      console.log("❌ Frontend transformation failed:", error.message);
    }

    // 5. Check for specific issues with the current implementation
    console.log("\n🔍 Diagnosing specific issues:");

    // a. Token present but wrong data structure
    if (data.token && data.user && !data.data) {
      console.log(
        "✅ IDENTIFIED ISSUE: Backend returns 'user' property but frontend expects 'data'"
      );
      console.log(
        "   Solution: Update frontend to handle both formats (already fixed in your code)"
      );
    }

    // b. ID mapping issue
    if (userData && userData._id && !userData.id) {
      console.log(
        "✅ IDENTIFIED ISSUE: Backend uses '_id' but frontend expects 'id'"
      );
      console.log(
        "   Solution: Map '_id' to 'id' in frontend (already fixed in your code)"
      );
    }

    // c. active vs isActive
    if (
      userData &&
      userData.active !== undefined &&
      userData.isActive === undefined
    ) {
      console.log(
        "✅ IDENTIFIED ISSUE: Backend uses 'active' but frontend expects 'isActive'"
      );
      console.log(
        "   Solution: Map properties in frontend (already fixed in your code)"
      );
    }

    return {
      originalResponse: data,
      transformedResponse: transformedData,
      diagnostics: {
        formatMismatch: data.user && !data.data,
        idFieldMismatch: userData && userData._id && !userData.id,
        activeFieldMismatch:
          userData &&
          userData.active !== undefined &&
          userData.isActive === undefined,
      },
    };
  } catch (error) {
    console.error("❌ Login test failed:", error);
    return { error: error.message };
  }
}

// Export for browser usage
if (typeof window !== "undefined") {
  window.testLogin = testLogin;
  console.log(
    "Login test utility loaded. Call testLogin() with email and password to test."
  );
}

// For Node.js
if (typeof module !== "undefined") {
  module.exports = { testLogin };

  // Auto-run if called directly
  if (require.main === module) {
    const email = process.argv[2];
    const password = process.argv[3];

    if (email && password) {
      testLogin(email, password).then((result) => {
        console.log("\n📋 Test complete!");
      });
    } else {
      console.log("Usage: node test-auth.js <email> <password>");
    }
  }
}
