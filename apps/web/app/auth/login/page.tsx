'use client'

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "../../services/auth";
import Cookies from "js-cookie";
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

interface FormData {
  emailOrUsername: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    emailOrUsername: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState<boolean>(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState<boolean>(false);
  
  const recaptchaToken = useRef<string>("");
  
  const RECAPTCHA_SITE_KEY = "6LcKQz8rAAAAAEek98Cr-JG99Xzxkjb9ma8mNxtu";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setRecaptchaLoaded(true);
      // Render the reCAPTCHA widget
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptchaWidget = window.grecaptcha.render("recaptcha-container", {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: onRecaptchaVerified,
          });
        });
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const onRecaptchaVerified = (token: string): void => {
        console.log("reCAPTCHA verified with token:", token);
    
    setRecaptchaVerified(true);
    
    recaptchaToken.current = token;
    
    if (error && error.includes("reCAPTCHA")) {
      setError(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

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
      const response: LoginResponse = await login({
        ...formData,
        recaptchaToken: token
      });
      
      if (response.success) {
        await Cookies.set('tok_UID', response.token as string, { expires: 30 });
        setSuccess("Login successful!");
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError(response.error || "Login failed. Please check your credentials.");
        
        if (response.error?.includes("reCAPTCHA") || response.error?.includes("robot")) {
          window.grecaptcha?.reset(window.grecaptchaWidget);
          setRecaptchaVerified(false);
          recaptchaToken.current = "";
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      
      window.grecaptcha?.reset(window.grecaptchaWidget);
      setRecaptchaVerified(false);
      recaptchaToken.current = "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="md:w-full py-30 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="py-5 bg-[#eef0f3]">
            <CardHeader>
              <CardTitle className="text-3xl">Log in to Vistro.shop</CardTitle>
              <CardDescription className="text-lg">Enter your details to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrUsername" className="text-2xl">Username or Email</Label>
                  <Input
                    id="emailOrUsername"
                    name="emailOrUsername"
                    placeholder="username or name@example.com"
                    className="py-5 bg-white/80"
                    required
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-2xl">Password</Label>
                    <a
                      href="/auth/forgot-password"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="password"
                    className="py-5 bg-white/80"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                {/* Google reCAPTCHA */}
                <div className="flex justify-center my-4">
                  <div id="recaptcha-container"></div>
                </div>
                
                {recaptchaVerified && (
                  <div className="text-center text-sm text-green-600">
                    ✓ reCAPTCHA verification successful
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-500">{success}</p>}

                <Button type="submit" className="w-full text-xl p-5" disabled={loading}>
                  {loading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging In...
                </> : "Log in"}
                </Button>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="/auth/register" className="text-blue-600 hover:underline">
                    Sign up
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}