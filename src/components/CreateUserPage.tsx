import { useState } from "react";
import React from "react";
import { UserPlus, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createUser } from "../services/auth";

interface CreateUserPageProps {
  isDark: boolean;
}

export function CreateUserPage({ isDark }: CreateUserPageProps) {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    rollNumber: "",
    department: "",
    team: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const roles = [
    "President",
    "Vice President",
    "Secretary",
    "Treasurer",
    "Lead",
    "Co-Lead",
    "Associate",
    "Board",
  ];

  const teams = [
    "PR",
    "Event",
    "Content",
    "Photography",
    "Creative",
    "Video",
    "Design",
    "Technical",
    "Media",
    "DEVS Lab",
    "Other",
  ];

  const departments = [
    "AERO",
    "AUTO",
    "BME",
    "BT",
    "CHEM",
    "CIVIL",
    "CSE",
    "CSE (CS)",
    "CSBS",
    "CSD",
    "EEE",
    "ECE",
    "FT",
    "IT",
    "AIML",
    "AIDS",
    "MECH",
    "MCT",
    "R&A",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate password match
    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;

      if (confirmPassword && password !== confirmPassword) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setIsLoading(true);

    try {
      const result = await createUser(
        formData.username,
        formData.name,
        formData.rollNumber,
        formData.department,
        formData.team,
        formData.role,
        formData.password
      );

      if (result.success) {
        // Show success message
        setShowSuccessMessage(true);

        // Reset form after 2 seconds
        setTimeout(() => {
          setFormData({
            username: "",
            name: "",
            rollNumber: "",
            department: "",
            team: "",
            role: "",
            password: "",
            confirmPassword: "",
          });
          setShowSuccessMessage(false);
        }, 2000);
      } else {
        setApiError(result.message || "Failed to create user");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.username &&
    formData.name &&
    formData.rollNumber &&
    formData.department &&
    formData.team &&
    formData.role &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen w-full p-4 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 blur-3xl opacity-20"
        style={{
          background: isDark
            ? "radial-gradient(circle, #4a1a4a 0%, transparent 70%)"
            : "radial-gradient(circle, #b91372 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 blur-3xl opacity-15"
        style={{
          background: isDark
            ? "radial-gradient(circle, #b91372 0%, transparent 70%)"
            : "radial-gradient(circle, #4a1a4a 0%, transparent 70%)",
        }}
      />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto relative z-10 pt-24">
        <div
          className="shadow-2xl p-8 md:p-12 backdrop-blur-sm mt-5 relative z-0 flex flex-col"
          style={{
            backgroundColor: isDark
              ? "rgba(10, 17, 40, 0.8)"
              : "rgba(255, 255, 255, 0.9)",
            border: `1px solid ${
              isDark ? "rgba(74, 26, 74, 0.3)" : "rgba(185, 19, 114, 0.2)"
            }`,
            maxHeight: "calc(100vh - 140px)",
          }}
        >
          <div className="text-center mb-8">
            <h1
              className="text-3xl md:text-4xl mb-2"
              style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
            >
              Create User
            </h1>
            <p
              className="text-sm opacity-60"
              style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
            >
              Fill in the details to create a new user
            </p>
          </div>

          {/* API Error Message */}
          {apiError && (
            <div
              className="mb-6 p-3 flex items-center gap-2 text-sm"
              style={{
                backgroundColor: isDark
                  ? "rgba(185, 19, 114, 0.2)"
                  : "rgba(185, 19, 114, 0.1)",
                border: "1px solid rgba(185, 19, 114, 0.5)",
                color: isDark ? "#ff6b9d" : "#b91372",
              }}
            >
              <AlertCircle className="w-4 h-4" />
              <span>{apiError}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Scrollable form container */}
            <div
              className="overflow-y-auto pr-2 flex-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: isDark ? "#4a1a4a #0a1128" : "#b91372 #f5f0ff",
              }}
            >
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(74, 26, 74, 0.2)"
                        : "rgba(185, 19, 114, 0.1)",
                      color: isDark ? "#f5f0ff" : "#0a1128",
                      border: isDark
                        ? "1px solid rgba(74, 26, 74, 0.3)"
                        : "1px solid rgba(185, 19, 114, 0.3)",
                    }}
                  />
                </div>

                {/* Name */}
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(74, 26, 74, 0.2)"
                        : "rgba(185, 19, 114, 0.1)",
                      color: isDark ? "#f5f0ff" : "#0a1128",
                      border: isDark
                        ? "1px solid rgba(74, 26, 74, 0.3)"
                        : "1px solid rgba(185, 19, 114, 0.3)",
                    }}
                  />
                </div>

                {/* Roll Number */}
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
                  >
                    Roll Number
                  </label>
                  <input
                    type="number"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    placeholder="Enter roll number"
                    className="w-full px-4 py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(74, 26, 74, 0.2)"
                        : "rgba(185, 19, 114, 0.1)",
                      color: isDark ? "#f5f0ff" : "#0a1128",
                      border: isDark
                        ? "1px solid rgba(74, 26, 74, 0.3)"
                        : "1px solid rgba(185, 19, 114, 0.3)",
                    }}
                  />
                </div>

                {/* Department Dropdown */}
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
                  >
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(74, 26, 74, 0.2)"
                        : "rgba(185, 19, 114, 0.1)",
                      color: isDark ? "#f5f0ff" : "#0a1128",
                      border: isDark
                        ? "1px solid rgba(74, 26, 74, 0.3)"
                        : "1px solid rgba(185, 19, 114, 0.3)",
                    }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option
                        key={dept}
                        value={dept}
                        style={{
                          backgroundColor: isDark ? "#0a1128" : "#ffffff",
                          color: isDark ? "#f5f0ff" : "#0a1128",
                        }}
                      >
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team Dropdown */}
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
                  >
                    Team
                  </label>
                  <select
                    name="team"
                    value={formData.team}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(74, 26, 74, 0.2)"
                        : "rgba(185, 19, 114, 0.1)",
                      color: isDark ? "#f5f0ff" : "#0a1128",
                      border: isDark
                        ? "1px solid rgba(74, 26, 74, 0.3)"
                        : "1px solid rgba(185, 19, 114, 0.3)",
                    }}
                  >
                    <option value="">Select Team</option>
                    {teams.map((team) => (
                      <option
                        key={team}
                        value={team}
                        style={{
                          backgroundColor: isDark ? "#0a1128" : "#ffffff",
                          color: isDark ? "#f5f0ff" : "#0a1128",
                        }}
                      >
                        {team}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
                  >
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(74, 26, 74, 0.2)"
                        : "rgba(185, 19, 114, 0.1)",
                      color: isDark ? "#f5f0ff" : "#0a1128",
                      border: isDark
                        ? "1px solid rgba(74, 26, 74, 0.3)"
                        : "1px solid rgba(185, 19, 114, 0.3)",
                    }}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option
                        key={role}
                        value={role}
                        style={{
                          backgroundColor: isDark ? "#0a1128" : "#ffffff",
                          color: isDark ? "#f5f0ff" : "#0a1128",
                        }}
                      >
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(74, 26, 74, 0.2)"
                        : "rgba(185, 19, 114, 0.1)",
                      color: isDark ? "#f5f0ff" : "#0a1128",
                      border: isDark
                        ? "1px solid rgba(74, 26, 74, 0.3)"
                        : "1px solid rgba(185, 19, 114, 0.3)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(74, 26, 74, 0.2)"
                        : "rgba(185, 19, 114, 0.1)",
                      color: isDark ? "#f5f0ff" : "#0a1128",
                      border: isDark
                        ? "1px solid rgba(74, 26, 74, 0.3)"
                        : "1px solid rgba(185, 19, 114, 0.3)",
                    }}
                  />
                  {passwordError && (
                    <p className="text-xs mt-1" style={{ color: "#b91372" }}>
                      {passwordError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button - Now outside scrollable area */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full py-4 mt-6 transition-all hover:scale-105 hover:shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)"
                  : "linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating User...</span>
                </>
              ) : (
                <span>Create User</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[100]"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="shadow-2xl p-8 max-w-md mx-4 text-center"
            style={{
              backgroundColor: isDark
                ? "rgba(10, 17, 40, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              border: `2px solid ${
                isDark ? "rgba(74, 26, 74, 0.5)" : "rgba(185, 19, 114, 0.3)"
              }`,
            }}
          >
            <CheckCircle
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "#b91372" }}
            />
            <h2
              className="text-2xl mb-2"
              style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
            >
              User Created Successfully!
            </h2>
            <p
              className="text-sm opacity-75"
              style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
            >
              The user has been added to the system.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
