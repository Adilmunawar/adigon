
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { LoaderCircle, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DeveloperCredit from "./DeveloperCredit";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      gender: undefined,
    },
  });

  const toggleFormType = () => {
    setIsSignIn(!isSignIn);
    setAuthError(null);
    setAuthSuccess(null);
    form.reset({
      email: "",
      password: "",
      name: "",
      gender: undefined,
    });
  };

  const handleAuthError = (error: any) => {
    console.error('🚨 Auth error:', error);
    
    const errorMessage = error?.message || 'An unexpected error occurred';
    
    // Handle common authentication errors with user-friendly messages
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    } else if (errorMessage.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    } else if (errorMessage.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    } else if (errorMessage.includes('Signup disabled')) {
      return 'Account registration is currently disabled. Please contact support.';
    } else if (errorMessage.includes('Too many requests')) {
      return 'Too many login attempts. Please wait a moment and try again.';
    } else if (errorMessage.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    } else if (errorMessage.includes('Unable to validate email address')) {
      return 'Please enter a valid email address.';
    } else if (errorMessage.includes('Database connection')) {
      return 'Connection issue. Please try again in a moment.';
    }
    
    return errorMessage;
  };

  const onSubmit = async (values: AuthFormData) => {
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      console.log(`🔄 Attempting ${isSignIn ? 'sign in' : 'sign up'} for:`, values.email);

      if (isSignIn) {
        // Sign in flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          setAuthError(handleAuthError(error));
          return;
        }

        if (data.user) {
          console.log('✅ Sign in successful');
          setAuthSuccess('Welcome back! Signing you in...');
          toast.success("Successfully signed in!");
          
          // Clear form after successful login
          form.reset();
        }
      } else {
        // Sign up flow with validation
        if (!values.name?.trim()) {
          setAuthError('Name is required for registration');
          return;
        }
        
        if (!values.gender) {
          setAuthError('Please select your gender');
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name.trim(),
              gender: values.gender,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          setAuthError(handleAuthError(error));
          return;
        }

        if (data.user) {
          console.log('✅ Sign up successful');
          
          if (data.user.email_confirmed_at) {
            setAuthSuccess('Account created successfully! You can now sign in.');
            toast.success("Account created! You can now sign in.");
          } else {
            setAuthSuccess('Account created! Please check your email for the confirmation link.');
            toast.success("Account created! Please check your email to confirm your account.");
          }
          
          // Clear form and switch to sign in
          form.reset();
          setTimeout(() => {
            setIsSignIn(true);
            setAuthSuccess(null);
          }, 3000);
        }
      }
    } catch (error: any) {
      console.error('🚨 Unexpected auth error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isSignIn ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignIn 
              ? "Sign in to access your account" 
              : "Sign up to get started with your account"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Success Alert */}
          {authSuccess && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{authSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name field for sign up */}
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Email field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="Enter your email" 
                        {...field}
                        disabled={isSubmitting}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password" 
                          {...field}
                          disabled={isSubmitting}
                          autoComplete={isSignIn ? "current-password" : "new-password"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender field for sign up */}
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isSignIn ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Form>

          {/* Toggle between sign in/up */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
              <Button 
                variant="link" 
                onClick={toggleFormType} 
                className="p-0 h-auto font-semibold text-primary hover:underline"
                disabled={isSubmitting}
              >
                {isSignIn ? "Sign up" : "Sign in"}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <DeveloperCredit />
      </div>
    </div>
  );
}
