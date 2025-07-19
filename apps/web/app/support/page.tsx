"use client"

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Check, Loader2, AlertTriangle, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import Discord from "../../app/assets/icons/discord.png";
import Image from 'next/image';
import Cookies from 'js-cookie';
import { contactSupport } from 'app/services/reviewsAndContact';

// Contact Form Component
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ hours: any; minutes: number } | number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<Boolean | undefined>(false);

  const tok = Cookies.get('tok_UID');

  // Set up react-hook-form
  const form = useForm({
    defaultValues: {
      firstName: '',
      email: '',
      contactReason: 'product-support',
      message: ''
    }
  });

  useEffect(() => {
    if (tok) {
      setIsAuthenticated(true)
    }
  }, [tok])

  // Check for previous submissions in local storage when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      const storedSubmission = localStorage.getItem(`support_submission_${tok}`);
      if (storedSubmission) {
        const parsedSubmission = JSON.parse(storedSubmission);
        setLastSubmissionTime(parsedSubmission.timestamp);
      }
    }
  }, [isAuthenticated]);

  // Update countdown timer if there's a recent submission
  useEffect(() => {
    if (!lastSubmissionTime) return;

    const updateTimeRemaining = () => {
      const now = Date.now();
      const submissionTime = new Date(lastSubmissionTime).getTime();
      const hoursPassed = (now - submissionTime) / (1000 * 60 * 60);

      if (hoursPassed >= 24) {
        // Reset if 24 hours have passed
        setLastSubmissionTime(null);
        localStorage.removeItem(`support_submission_${tok}`);
        setTimeRemaining(0);
        return;
      }

      // Calculate remaining time in hours and minutes
      const remainingHours = Math.floor(24 - hoursPassed);
      const remainingMinutes = Math.floor((24 - hoursPassed - remainingHours) * 60);
      setTimeRemaining({ hours: remainingHours, minutes: remainingMinutes });
    };

    // Update immediately
    updateTimeRemaining();

    // Then update every minute
    const intervalId = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(intervalId);
  }, [lastSubmissionTime]);

  // Check if submission is allowed based on rate limiting
  const isSubmissionAllowed = () => {
    if (!isAuthenticated) return false;
    if (!lastSubmissionTime) return true;

    const now = Date.now();
    const submissionTime = new Date(lastSubmissionTime).getTime();
    const hoursPassed = (now - submissionTime) / (1000 * 60 * 60);

    return hoursPassed >= 24;
  };

  const onSubmit = async (data: Object) => {
    // Check authentication
    if (!isAuthenticated) {
      setErrorMessage('Please log in to submit a support request.');
      return;
    }

    // Check rate limiting
    if (!isSubmissionAllowed()) {
      setErrorMessage('You can only submit one support request every 24 hours.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await contactSupport(data, tok || '')

      if (!response.success) {
        setErrorMessage(response.error);
        setIsSubmitting(false);
      } else {
        // Record submission time
        const submissionTime = new Date().toISOString();
        setLastSubmissionTime(submissionTime || '');

        // Store submission time in localStorage
        if (tok) {
          localStorage.setItem(`support_submission_${tok}`, JSON.stringify({
            timestamp: submissionTime
          }));
        }
        setSubmitSuccess(true);
        setIsSubmitting(false);
        form.reset({
          firstName: '',
          email: '',
          contactReason: 'product-support',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200 p-5">
      <CardHeader className="border-b border-slate-100 rounded-t-lg">
        <CardTitle className="text-3xl">Contact Support</CardTitle>
        <CardDescription className='text-xl'>
          Fill out the form below and we'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {!isAuthenticated && (
          <Alert className="mb-6 bg-indigo-50 border-indigo-200 text-indigo-800">
            <Info className="h-5 w-5 text-indigo-600" />
            <AlertTitle className='text-xl'>Authentication Required</AlertTitle>
            <AlertDescription className='text-lg'>
              You need to be logged in to submit a support request.
              <Button
                className="ml-2 text-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                size="lg"
                onClick={() => window.location.href = '/auth/login'}
              >
                Log In
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isAuthenticated && lastSubmissionTime && !isSubmissionAllowed() && (
          <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <AlertTitle className='text-xl'>Rate Limit</AlertTitle>
            <AlertDescription className='text-lg'>
              You can submit only one support request every 24 hours.
              Time remaining: {typeof timeRemaining === 'object' ?
                `${timeRemaining.hours}h ${timeRemaining.minutes}m` :
                `${timeRemaining}h`}
            </AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <Check className="h-5 w-5 text-green-600" />
            <AlertTitle className='text-xl'>Success!</AlertTitle>
            <AlertDescription className='text-lg'>
              Thank you for your inquiry! We'll get back to you as soon as possible.
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className='text-xl'>Error</AlertTitle>
            <AlertDescription className='text-lg'>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="firstName" className="text-2xl font-medium">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="firstName"
                      className='p-5'
                      placeholder="Enter your first name"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email" className="text-2xl font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      className='p-5'
                      placeholder="your.email@example.com"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contactReason" className="text-2xl font-medium">
                    Contact Reason
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className='p-5 text-lg'>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="product-support" className='text-lg'>Product Support</SelectItem>
                      <SelectItem value="legal-inquiry" className='text-lg'>Legal Inquiry</SelectItem>
                      <SelectItem value="general-inquiry" className='text-lg'>General Inquiry</SelectItem>
                      <SelectItem value="other" className='text-lg'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="message" className="text-2xl font-medium">
                    Your Message
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your inquiry..."
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!!(isSubmitting || !isAuthenticated || (lastSubmissionTime && !isSubmissionAllowed()))}
              className="w-full bg-black text-white text-lg py-5 hover:bg-black/90 hover:cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : !isAuthenticated ? (
                'Login Required'
              ) : (lastSubmissionTime && !isSubmissionAllowed()) ? (
                'Rate Limited (1 per 24h)'
              ) : (
                'Submit Your Inquiry'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Contact Us Page
export default function Page() {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    setIsInView(true);
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-30">
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
          <div className="h-1 w-20 bg-white mx-auto"></div>
          <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto">
            Have questions or need assistance? Our team is here to help.
            Fill out the form below and we'll respond as quickly as possible.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center px-20">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">Email</h3>
            <p className="text-slate-600">support@vistro.shop</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="w-full max-w-2xl mx-auto">
          <ContactForm />
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-4xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium text-slate-900 mb-2">How quickly can I expect a response?</h3>
              <p className="text-slate-600">We typically respond to all inquiries within 24-48 business hours.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium text-slate-900 mb-2">What information should I include in my message?</h3>
              <p className="text-slate-600">Please be as specific as possible about your issue or question, including any relevant account details or order numbers if applicable.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium text-slate-900 mb-2">How often can I submit support requests?</h3>
              <p className="text-slate-600">To ensure our team can provide quality support to all users, each account is limited to one support request every 24 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}