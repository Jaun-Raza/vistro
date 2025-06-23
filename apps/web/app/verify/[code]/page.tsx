'use client'

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyUser } from "../../services/auth";

export default function VerifyPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [verifying, setVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState({
    success: false,
    message: "",
    error: "",
  });

  useEffect(() => {
    const handleVerification = async () => {
      try {
        console.log("Full pathname:", pathname);

        const pathSegments = pathname.split('/');
        const verificationCode = pathSegments[pathSegments.length - 1];
        
        console.log("Extracted verification code:", verificationCode);
        
        if (!verificationCode || verificationCode === "verify") {
          setVerifying(false);
          setVerificationResult({
            success: false,
            message: "",
            error: "Invalid verification link. No verification code found.",
          });
          return;
        }

        setVerifying(true);
        const response = await verifyUser(verificationCode);
        console.log("Verification response:", response);

        setVerificationResult({
          success: response.success,
          message: response.message || "Your account has been successfully verified!",
          error: response.error || "",
        });
      } catch (err) {
        console.error("Verification error:", err);
        setVerificationResult({
          success: false,
          message: "",
          error: "Something went wrong during verification. Please try again later.",
        });
      } finally {
        setVerifying(false);
      }
    };

    // Call verification function when component mounts
    handleVerification();
  }, []); // Empty dependency array to run only once on mount

  const navigateToLogin = () => {
    router.push("/auth/login");
  };

  const navigateToRegister = () => {
    router.push("/auth/register");
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="md:w-full py-30 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="py-5 bg-[#eef0f3]">
            <CardHeader>
              <CardTitle className="text-3xl">Account Verification</CardTitle>
              <CardDescription className="text-lg">
                {verifying ? "Verifying your account..." : "Verification result"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verifying ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                  </div>
                  <p className="text-lg">Please wait while we verify your account...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {verificationResult.success ? (
                    <>
                      <div className="bg-green-100 text-green-700 p-4 rounded-md flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p>{verificationResult.message}</p>
                      </div>
                      <div className="text-center">
                        <p className="mb-4">You can now log in to your account.</p>
                        <Button onClick={navigateToLogin} className="w-full text-xl p-5">
                          Go to Login
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-red-100 text-red-700 p-4 rounded-md flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p>{verificationResult.error}</p>
                      </div>
                      <div className="text-center">
                        <p className="mb-4">
                          {verificationResult.error.includes("register") 
                            ? "It seems you need to create an account first."
                            : "Please try again or contact support if the issue persists."}
                        </p>
                        {verificationResult.error.includes("register") ? (
                          <Button onClick={navigateToRegister} className="w-full text-xl p-5">
                            Go to Registration
                          </Button>
                        ) : (
                          <Button onClick={navigateToLogin} className="w-full text-xl p-5">
                            Go to Login
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}