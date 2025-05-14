import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "wouter";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Extend the schema for client-side validation
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Extend the user schema for client-side validation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      role: "User",
    },
  });

  const onLoginSubmit = loginForm.handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  const onRegisterSubmit = registerForm.handleSubmit((data) => {
    registerMutation.mutate(data);
  });

  // Redirect if user is already logged in
  if (user && !isLoading) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">TimeTrack Pro</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account or create a new one</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Enter your credentials to sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={onLoginSubmit} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign in"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="link" onClick={() => setActiveTab("register")}>
                    Don't have an account? Register
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Register</CardTitle>
                  <CardDescription>Create a new account to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={onRegisterSubmit} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Choose a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="link" onClick={() => setActiveTab("login")}>
                    Already have an account? Login
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:block w-1/2 bg-cover bg-center p-12" style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' version=\'1.1\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' xmlns:svgjs=\'http://svgjs.dev/svgjs\' width=\'1440\' height=\'560\' preserveAspectRatio=\'none\' viewBox=\'0 0 1440 560\'%3e%3cg mask=\'url(%26quot%3b%23SvgjsMask1007%26quot%3b)\' fill=\'none\'%3e%3crect width=\'1440\' height=\'560\' x=\'0\' y=\'0\' fill=\'rgba(67%2c 56%2c 202%2c 1)\'%3e%3c/rect%3e%3cpath d=\'M0%2c430.709C84.321%2c431.844%2c175.251%2c462.829%2c243.386%2c413.835C311.655%2c364.763%2c311.102%2c265.095%2c343.454%2c186.436C371.022%2c119.067%2c420.775%2c60.763%2c421.104%2c-13.128C421.451%2c-91.481%2c394.05%2c-167.589%2c347.822%2c-230.906C301.262%2c-294.662%2c233.522%2c-337.283%2c157.4%2c-360.311C79.286%2c-383.999%2c-3.633%2c-390.634%2c-83.479%2c-373.159C-168.083%2c-354.588%2c-252.209%2c-323.116%2c-310.124%2c-259.823C-368.472%2c-196.034%2c-384.094%2c-108.318%2c-408.82%2c-28.82C-434.658%2c54.115%2c-486.63%2c138.351%2c-456.705%2c219.752C-426.913%2c300.724%2c-333.772%2c338.75%2c-254.563%2c373.088C-181.33%2c404.815%2c-84.591%2c429.571%2c0%2c430.709\' fill=\'%23372796\'%3e%3c/path%3e%3cpath d=\'M1440 970.347C1529.236 965.612 1595.088 901.255 1663.991 848.27 1729.362 798.063 1795.004 748.334 1829.314 672.362 1863.723 596.136 1862.053 511.6 1851.453 427.737 1841.202 346.793 1824.732 266.18 1775.304 199.66699999999998 1724.651 131.54899999999998 1654.886 78.90600000000003 1569.962 45.77399999999997 1485.239 12.714999999999975 1390.499-7.388000000000034 1301.683 4.024999999999977 1207.84 16.06999999999999 1111.553 51.172 1044.643 117.57899999999995 977.933 183.781 966.167 283.386 935.413 366.6 906.371 445.55 864.038 521.441 873.068 605.786 882.141 690.526 931.894 764.952 997.857 819.619 1063.135 873.737 1148.417 901.553 1232.244 914.48 1323.376 928.605 1350.764 975.082 1440 970.347\' fill=\'%234f38ca\'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id=\'SvgjsMask1007\'%3e%3crect width=\'1440\' height=\'560\' fill=\'white\'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e")' }}>
        <div className="h-full flex flex-col justify-center text-white">
          <h2 className="text-4xl font-bold mb-6">TimeTrack Pro</h2>
          <p className="text-xl mb-8">The complete solution for time tracking and project management.</p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Track Time</h3>
                <p className="text-white/80">Log hours spent on projects with detailed descriptions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Team Management</h3>
                <p className="text-white/80">Monitor workload and efficiency of team members</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M2 2a26.3 26.3 0 0 1 10 5c.6.5 1 1.1 1 2a3 3 0 0 1-3 3c-.9 0-1.5-.4-2-1a26.3 26.3 0 0 0-5-10Z"></path><path d="M20 20a26.3 26.3 0 0 1-10-5c-.6-.5-1-1.1-1-2a3 3 0 0 1 3-3c.9 0 1.5.4 2 1a26.3 26.3 0 0 0 5 10Z"></path></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Advanced Reporting</h3>
                <p className="text-white/80">Generate detailed reports by client, project, or time period</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}