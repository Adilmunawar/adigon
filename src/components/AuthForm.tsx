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
import { LoaderCircle, Eye, EyeOff, AlertCircle, CheckCircle, Sparkles, Mail, Lock, User } from "lucide-react";
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
      <Card className="glass-effect border border-border/30 shadow-2xl shadow-primary/10 animate-slide-in-right backdrop-blur-xl bg-background/80">
        <CardHeader className="text-center space-y-4 pb-6">
          {/* Logo/Icon with animation */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center animate-glow">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text animate-pulse">
              {isSignIn ? "Welcome Back" : "Join AdiGon AI"}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              {isSignIn 
                ? "Sign in to continue your AI journey" 
                : "Create your account and unlock the future"
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8 pb-8">
          {/* Success Alert with enhanced styling */}
          {authSuccess && (
            <Alert className="border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-300 animate-scale-in">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <AlertDescription className="font-medium">{authSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Error Alert with enhanced styling */}
          {authError && (
            <Alert variant="destructive" className="border-red-500/30 bg-gradient-to-r from-red-500/10 to-pink-500/10 animate-scale-in">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{authError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name field for sign up with icon */}
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="animate-slide-in-right delay-100">
                      <FormLabel className="text-foreground font-medium">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors group-focus-within:text-primary" />
                          <Input 
                            placeholder="Enter your full name" 
                            {...field}
                            disabled={isSubmitting}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Email field with icon */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="animate-slide-in-right delay-200">
                    <FormLabel className="text-foreground font-medium">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors group-focus-within:text-primary" />
                        <Input 
                          type="email"
                          placeholder="Enter your email" 
                          {...field}
                          disabled={isSubmitting}
                          autoComplete="email"
                          className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password field with enhanced styling */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="animate-slide-in-right delay-300">
                    <FormLabel className="text-foreground font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors group-focus-within:text-primary" />
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password" 
                          {...field}
                          disabled={isSubmitting}
                          autoComplete={isSignIn ? "current-password" : "new-password"}
                          className="pl-10 pr-12 h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 hover:bg-primary/10 transition-all duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender field for sign up with enhanced styling */}
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="animate-slide-in-right delay-400">
                      <FormLabel className="text-foreground font-medium">Gender</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30">
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

              {/* Enhanced submit button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 animate-slide-in-right delay-500" 
                disabled={isSubmitting}
              >
                {isSubmitting && <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />}
                {isSignIn ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Form>

          {/* Enhanced toggle section */}
          <div className="text-center pt-4 animate-slide-in-right delay-600">
            <p className="text-sm text-muted-foreground mb-3">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button 
              variant="outline" 
              onClick={toggleFormType} 
              className="w-full h-11 border-border/50 bg-background/30 hover:bg-primary/5 hover:border-primary/50 text-foreground font-medium transition-all duration-300 transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSignIn ? "Create Account" : "Sign In"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 animate-slide-in-right delay-700">
        <DeveloperCredit />
      </div>
    </div>
  );
}
