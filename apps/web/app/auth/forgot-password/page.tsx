'use client'

import { useState, useEffect } from "react";
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
import { forgotPass, forgotPassChallenge, verifyOTP } from "app/services/auth";
import { Loader2 } from "lucide-react";

export default function Page() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: ["", "", "", "", "", ""],
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    message: "",
  });

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      validatePassword(value);
    }

    setError(null);
  };

  const handleOtpChange = (index: any, value: any) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp });

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    setError(null);
  };

  const handleOtpKeyDown = (index: any, e: any) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e: any) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!pastedData || !/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...formData.otp];

    digits.forEach((digit: any, index: any) => {
      if (index < 6) newOtp[index] = digit;
    });

    setFormData({ ...formData, otp: newOtp });

    const nextEmptyIndex = newOtp.findIndex(val => !val);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    document.getElementById(`otp-${focusIndex}`)?.focus();
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const otpValue = formData.otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the 6-digit code");
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
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

    return true;
  };

  const requestResetCode = async () => {
    if (!validateStep1()) return;

    setLoading(true);

    try {
      const response = await forgotPassChallenge(formData.email);
      if (response.success) {
        setSuccess("Recovery code sent to your email");
        setLoading(false);
        setStep(2);
        setTimeLeft(60);
      } else {
        setError(response.error || "Challenge failed. Try again later.");
        setLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to send recovery code. Please try again.");
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!validateStep2()) return;

    setLoading(true);

    try {
      const otpValue = formData.otp.join("");

      const response = await verifyOTP(otpValue, formData.email);

      if (response.success) {
        setSuccess("Code verified successfully");
        setLoading(false);
        setStep(3);
      } else {
        setError(response.error || "Verification failed. Try again later.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Invalid code. Please try again.");
      setLoading(false);
    }
  };

  const resetPasswordSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);

    try {
      const otpValue = formData.otp.join("");

      const response = await forgotPass(formData.email, otpValue, formData.password);

      if (response.success) {
        setSuccess("Password reset successfully! You can now login with your new password.");
        setLoading(false);
        
        setTimeout(() => {
          window.location.href='/auth/login'
        }, 3000)
      } else {
        setError(response.error || "Password reset failed. Try again later.");
        setLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to reset password. Please try again.");
      setLoading(false);
    }
  };

  const goToPreviousStep = () => {
    setError(null);
    setSuccess(null);
    setStep(step - 1);
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
              <CardTitle className="text-3xl">Reset Password</CardTitle>
              <CardDescription className="text-lg">Step 1: Enter your email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-lg">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your account email"
                    className="py-5 bg-white/80"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-500">{success}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full text-xl p-5"
                onClick={requestResetCode}
                disabled={loading}
              >
                {loading ?  <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </> : "Send Recovery Code"}
              </Button>
            </CardFooter>
          </>
        );

      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-3xl">Reset Password</CardTitle>
              <CardDescription className="text-lg">Step 2: Enter verification code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">
                  We've sent a 6-digit verification code to {formData.email}.
                  Please enter it below.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-lg">Verification Code</Label>
                  <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                    {formData.otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-12 h-12 text-center text-xl bg-white/80"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-500">
                      Didn't receive the code?
                    </p>
                    {timeLeft > 0 ? (
                      <p className="text-sm text-gray-500">
                        Resend in {timeLeft} seconds
                      </p>
                    ) : (
                      <Button
                        variant="link"
                        className="text-indigo-600 p-0 h-auto"
                        onClick={requestResetCode}
                        disabled={loading}
                      >
                        Resend Code
                      </Button>
                    )}
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-500">{success}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-4">
              <Button
                variant="outline"
                className="w-1/2 text-lg p-5"
                onClick={goToPreviousStep}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                className="w-1/2 text-lg p-5"
                onClick={verifyCode}
                disabled={loading}
              >
                {loading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </> : "Verify Code"}
              </Button>
            </CardFooter>
          </>
        );

      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-3xl">Reset Password</CardTitle>
              <CardDescription className="text-lg">Step 3: Create new password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-lg">New Password</Label>
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

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-500">{success}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-4">
              <Button
                variant="outline"
                className="w-1/2 text-lg p-5"
                onClick={goToPreviousStep}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                className="w-1/2 text-lg p-5"
                onClick={resetPasswordSubmit}
                disabled={loading}
              >
                {loading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </> : "Reset Password"}
              </Button>
            </CardFooter>
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

            {step === 1 && (
              <div className="text-center text-sm p-4">
                Remember your password?{" "}
                <a href="/auth/login" className="text-indigo-600 hover:underline">
                  Back to login
                </a>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}