
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
import { LoaderCircle } from "lucide-react";
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
import DeveloperCredit from "./DeveloperCredit";

const formSchema = z.object({
  isSignIn: z.boolean(),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
}).superRefine((data, ctx) => {
  if (!data.isSignIn) { // This is for Sign Up
    if (!data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required.",
        path: ["name"],
      });
    }
    if (!data.gender) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a gender.",
        path: ["gender"],
      });
    }
  }
});

export default function AuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isSignIn: true,
      email: "",
      password: "",
      name: "",
      gender: undefined,
    },
  });

  const toggleFormType = () => {
    const newIsSignIn = !isSignIn;
    setIsSignIn(newIsSignIn);
    form.reset();
    form.setValue("isSignIn", newIsSignIn);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log('Attempting authentication with:', values.email);
    
    try {
      if (values.isSignIn) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (error) {
          console.error('Sign in error:', error);
          
          // Handle specific error cases
          if (error.message.toLowerCase().includes('invalid login credentials') || 
              error.message.toLowerCase().includes('invalid email or password')) {
            toast.error("Invalid email or password. Please check your credentials and try again.");
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            toast.error("Please check your email and click the confirmation link before signing in.");
          } else if (error.message.toLowerCase().includes('signup disabled')) {
            toast.error("Sign up is currently disabled. Please contact support.");
          } else if (error.message.toLowerCase().includes('too many requests')) {
            toast.error("Too many login attempts. Please wait a moment and try again.");
          } else {
            toast.error(`Login failed: ${error.message}`);
          }
        } else if (data.user) {
          console.log('Sign in successful:', data.user.email);
          toast.success("Signed in successfully!");
          
          // Clear form on successful login
          form.reset();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
              gender: values.gender,
            },
            emailRedirectTo: `${window.location.origin}/`,
          }
        });
        
        if (error) {
          console.error('Sign up error:', error);
          
          if (error.message.toLowerCase().includes('user already registered')) {
            toast.error("An account with this email already exists. Please sign in instead.");
          } else if (error.message.toLowerCase().includes('signup disabled')) {
            toast.error("Sign up is currently disabled. Please contact support.");
          } else {
            toast.error(`Sign up failed: ${error.message}`);
          }
        } else if (data.user) {
          console.log('Sign up successful:', data.user.email);
          toast.success("Sign up successful! Please check your email for the confirmation link.");
          
          // Clear form on successful signup
          form.reset();
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <Card className="w-full bg-background/80 backdrop-blur-sm border-border/50 shadow-2xl shadow-primary/10 animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{isSignIn ? "Sign In" : "Sign Up"}</CardTitle>
          <CardDescription>
            {isSignIn ? "to continue to your chat history" : "to create an account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Adil Munawar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isSignIn && (
                 <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isSignIn ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="mt-6 text-center text-sm text-muted-foreground">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
        <Button variant="link" onClick={toggleFormType} className="p-0 h-auto font-semibold text-primary hover:text-primary/90 transition-colors">
          {isSignIn ? "Sign Up" : "Sign In"}
        </Button>
      </div>
      <div className="mt-8">
        <DeveloperCredit />
      </div>
    </div>
  );
}
