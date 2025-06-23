'use client'

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { register } from "../../services/auth";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: string, options: ReCaptchaOptions) => number;
      getResponse: (widgetId: number) => string;
      reset: (widgetId: number) => void;
    };
    grecaptchaWidget: number;
  }
}

interface ReCaptchaOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    day: "",
    month: "",
    year: "",
    country: "",
    gender: "",
    discordUserId: "",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState<boolean>(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    message: "",
  });

  const recaptchaToken = useRef<string>("");
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const RECAPTCHA_SITE_KEY = "6LcKQz8rAAAAAEek98Cr-JG99Xzxkjb9ma8mNxtu";

  useEffect(() => {
    // Only attempt to load and render reCAPTCHA when on step 3
    if (step !== 3) return;

    // Clear previous scripts if any
    const existingScripts = document.querySelectorAll('script[src*="recaptcha"]');
    existingScripts.forEach(script => script.remove());

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setRecaptchaLoaded(true);
      // Make sure the container is actually in the DOM before rendering
      if (window.grecaptcha && recaptchaContainerRef.current) {
        window.grecaptcha.ready(() => {
          try {
            window.grecaptchaWidget = window.grecaptcha.render("recaptcha-container", {
              sitekey: RECAPTCHA_SITE_KEY,
              callback: onRecaptchaVerified,
              'expired-callback': () => {
                setRecaptchaVerified(false);
                recaptchaToken.current = "";
              },
              'error-callback': () => {
                console.error("reCAPTCHA error");
                setError("Error loading reCAPTCHA. Please refresh and try again.");
              }
            });
          } catch (error) {
            console.error("Error rendering reCAPTCHA:", error);
          }
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [step]); // Re-run when step changes to 3

  const onRecaptchaVerified = (token: string): void => {
    console.log("reCAPTCHA verified with token:", token);
    setRecaptchaVerified(true);
    recaptchaToken.current = token;

    if (error && error.includes("reCAPTCHA")) {
      setError(null);
    }
  };

  // List of countries (with UK at the top)
  const countries = [
    "United Kingdom", "United States", "Canada", "Australia",
    "Germany", "France", "Japan", "Brazil", "India", "China",
    "Spain", "Italy", "Mexico", "Russia", "South Korea",
    "Pakistan"
  ];

  // Generate day options 1-31
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  // Month options
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  // Generate year options (current year - 100 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 100 },
    (_, i) => (currentYear - i).toString()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check password strength when password field changes
    if (name === "password") {
      validatePassword(value);
    }

    // Reset any error messages when user types
    setError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

    const isValid =
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar;

    let message = "";
    if (!isValid) {
      message = "Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters";
    }

    setPasswordStrength({ isValid, message });
    return isValid;
  };

  const validateAge = (): boolean => {
    // Check if all date fields are provided
    if (!formData.day || !formData.month || !formData.year) {
      return false;
    }

    const day = parseInt(formData.day);
    const month = parseInt(formData.month) - 1; // JS months are 0-indexed
    const year = parseInt(formData.year);

    const birthDate = new Date(year, month, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 13;
  };


  const validateStep1 = () => {
    // Validate username
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }

    // Validate email and confirm email
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!formData.confirmEmail.trim()) {
      setError("Please confirm your email");
      return false;
    }

    if (formData.email !== formData.confirmEmail) {
      setError("Emails do not match");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    // Validate password and confirm password
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }

    if (!validatePassword(formData.password)) {
      setError(passwordStrength.message);
      return false;
    }

    if (!formData.confirmPassword.trim()) {
      setError("Please confirm your password");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Validate date of birth
    if (!formData.day || !formData.month || !formData.year) {
      setError("Complete date of birth is required");
      return false;
    }

    if (!validateAge()) {
      setError("You must be at least 13 years old to register");
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    // Validate country
    if (!formData.country) {
      setError("Please select your country");
      return false;
    }

    // Validate gender
    if (!formData.gender) {
      setError("Please select your gender");
      return false;
    }

    // Validate reCAPTCHA
    if (!recaptchaVerified) {
      setError("Please complete the reCAPTCHA verification");
      return false;
    }

    // Validate terms
    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return false;
    }

    return true;
  };

  const goToNextStep = () => {
    setError(null);

    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const goToPreviousStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation
    if (!validateStep3()) {
      return;
    }

    let token = recaptchaToken.current;
    if (!token && window.grecaptcha) {
      token = window.grecaptcha.getResponse(window.grecaptchaWidget);
    }

    if (!token) {
      setError("Please complete the reCAPTCHA verification");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await register({ ...formData, recaptchaToken: token });
      if (response.success) {
        setSuccess("Registration successful! Please check your email to verify your account.");
        setLoading(false);
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 3000);
      } else {
        setError(response.error || "Registration failed. Please try again.");
        setLoading(false);

        if (response.error?.includes("reCAPTCHA") || response.error?.includes("robot")) {
          window.grecaptcha?.reset(window.grecaptchaWidget);
          setRecaptchaVerified(false);
          recaptchaToken.current = "";
        }
      }

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);

      window.grecaptcha?.reset(window.grecaptchaWidget);
      setRecaptchaVerified(false);
      recaptchaToken.current = "";
    }
  };

  // Step progress indicator
  const StepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center">
        <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>1</div>
        <div className={`h-1 w-8 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
        <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>2</div>
        <div className={`h-1 w-8 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
        <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>3</div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-3xl">Create your account</CardTitle>
              <CardDescription className="text-lg">Step 1: Basic Information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-lg">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Choose a username"
                    className="py-5 bg-white/80"
                    required
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-lg">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="py-5 bg-white/80"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Confirm Email */}
                <div className="space-y-2">
                  <Label htmlFor="confirmEmail" className="text-lg">Confirm Email</Label>
                  <Input
                    id="confirmEmail"
                    name="confirmEmail"
                    type="email"
                    placeholder="Confirm your email"
                    className="py-5 bg-white/80"
                    required
                    value={formData.confirmEmail}
                    onChange={handleChange}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full text-xl p-5"
                onClick={goToNextStep}
              >
                Continue
              </Button>
            </CardFooter>
          </>
        );

      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-3xl">Create your account</CardTitle>
              <CardDescription className="text-lg">Step 2: Security Information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-lg">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    className="py-5 bg-white/80"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {passwordStrength.message && (
                    <p className="text-sm text-amber-600">{passwordStrength.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-lg">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="py-5 bg-white/80"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                {/* Date of Birth - UK Format (DD/MM/YYYY) */}
                <div className="space-y-2">
                  <Label className="text-lg">Date of Birth</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Day */}
                    <div>
                      <Label htmlFor="day" className="text-sm">Day</Label>
                      <Select
                        value={formData.day}
                        onValueChange={(value) => handleSelectChange("day", value)}
                      >
                        <SelectTrigger className="py-5 bg-white/80">
                          <SelectValue placeholder="DD" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Month */}
                    <div>
                      <Label htmlFor="month" className="text-sm">Month</Label>
                      <Select
                        value={formData.month}
                        onValueChange={(value) => handleSelectChange("month", value)}
                      >
                        <SelectTrigger className="py-5 bg-white/80">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Year */}
                    <div>
                      <Label htmlFor="year" className="text-sm">Year</Label>
                      <Select
                        value={formData.year}
                        onValueChange={(value) => handleSelectChange("year", value)}
                      >
                        <SelectTrigger className="py-5 bg-white/80">
                          <SelectValue placeholder="YYYY" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">You must be at least 13 years old to register</p>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-4">
              <Button
                variant="outline"
                className="w-1/2 text-lg p-5"
                onClick={goToPreviousStep}
              >
                Back
              </Button>
              <Button
                className="w-1/2 text-lg p-5"
                onClick={goToNextStep}
              >
                Continue
              </Button>
            </CardFooter>
          </>
        );

      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-3xl">Create your account</CardTitle>
              <CardDescription className="text-lg">Step 3: Final Details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-lg">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleSelectChange("country", value)}
                  >
                    <SelectTrigger className="py-5 bg-white/80">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-lg">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger className="py-5 bg-white/80">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Discord User ID */}
                <div className="space-y-2">
                  <Label htmlFor="discordUserId" className="text-lg">Discord User ID</Label>
                  <Input
                    id="discordUserId"
                    name="discordUserId"
                    placeholder="Your Discord user ID (optional)"
                    className="py-5 bg-white/80"
                    value={formData.discordUserId}
                    onChange={handleChange}
                  />
                </div>

                {/* Google reCAPTCHA */}
                <div className="flex justify-center my-4">
                  <div
                    id="recaptcha-container"
                    ref={recaptchaContainerRef}
                    className="g-recaptcha"
                  ></div>
                </div>

                {recaptchaVerified && (
                  <div className="text-center text-sm text-green-600">
                    ✓ reCAPTCHA verification successful
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, agreeToTerms: checked === true })
                    }
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I agree to the{" "}
                    <a href="/terms" className="text-indigo-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-indigo-600 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-500">{success}</p>}

                <div className="flex justify-between gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/2 text-lg p-5"
                    onClick={goToPreviousStep}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-1/2 text-lg p-5"
                    disabled={loading}
                  >
                    {loading ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </> : "Register"}
                  </Button>
                </div>

                <div className="text-center text-sm pt-2">
                  Already have an account?{" "}
                  <a href="/auth/login" className="text-indigo-600 hover:underline">
                    Log in
                  </a>
                </div>
              </form>
            </CardContent>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="md:w-full py-30 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="py-5 bg-[#eef0f3]">
            <StepIndicator />
            {renderStepContent()}
          </Card>
        </div>
      </div>
    </div>
  );
}