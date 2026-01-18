/**
 * Sign-Up Page - Handles new user registration
 * Modern, secure authentication with Supabase
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  School,
  Loader2,
  Phone,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSchoolListVisible, setSchoolListVisible] = useState(false);
  const [schoolInputValue, setSchoolInputValue] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    parentName: "",
    schoolName: "",
    grade: "",
    board: "",
    mobileNo: "",
    city: "",
    state: "",
  });
  const navigate = useNavigate();

  // Read query parameters for pre-filling signup form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mobileNo = params.get("mobileNo");

    if (mobileNo) {
      setFormData((prev) => ({
        ...prev,
        mobileNo: mobileNo,
      }));
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const grade = formData.grade ? parseInt(formData.grade, 10) : undefined;
      await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.fullName,
        formData.parentName,
        formData.schoolName || schoolInputValue,
        grade,
        formData.board,
        formData.mobileNo,
        formData.city,
        formData.state
      );
      navigate("/");
    } catch (error: any) {
      // Error handling is done in AuthProvider
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignUp();
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-lg mx-auto flex items-center justify-center mb-3 md:mb-4">
            <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Join Naviksha AI
          </h1>
          <p className="text-sm md:text-base text-white/80 px-2">
            Navigate Your Future with AI-Powered Career Guidance
          </p>
        </div>

        {/* Auth Card */}
        <Card className="glass border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg md:text-xl text-center">
              Create Account
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">

              {/* Full Name & Parent Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    required
                    className="focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="parentName"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Parent Name
                  </Label>
                  <Input
                    id="parentName"
                    type="text"
                    placeholder="Your parent's name"
                    value={formData.parentName}
                    onChange={(e) =>
                      handleInputChange("parentName", e.target.value)
                    }
                    required
                    className="focus-ring"
                  />
                </div>
              </div>

              {/* Email & Mobile Number Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="mobileNo"
                    className="flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Mobile Number
                  </Label>
                  <Input
                    id="mobileNo"
                    type="text"
                    placeholder="Your mobile number"
                    value={formData.mobileNo}
                    onChange={(e) =>
                      handleInputChange("mobileNo", e.target.value)
                    }
                    className="focus-ring"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="schoolName"
                  className="flex items-center gap-2"
                >
                  <School className="w-4 h-4" />
                  School Name
                </Label>
                <Command>
                  <CommandInput
                    placeholder="Input school name..."
                    value={schoolInputValue}
                    onValueChange={(value) => {
                      setSchoolInputValue(value);
                      setSchoolListVisible(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setSchoolListVisible(false);
                      }, 200);
                    }}
                    required
                  />
                  {isSchoolListVisible && (
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {[
                          "Angel Public School",
                          "BASANT VALLY PUBLIC SCHOOL",
                          "Beena English Medium School",
                          "Blooming buds zion academy",
                          "Bodhi Taru International School",
                          "Bright Scholar Senior Secondary School",
                          "Chanda Public School",
                          "Daffodils foundation for learning",
                          "Delhi English Academy",
                          "Devin Academy For Learning",
                          "Dnyan Sagar English Medium School",
                          "Dr. Shivajirao S. Jondhle International School",
                          "Fortune High School",
                          "GCC International School",
                          "Greenwood High School",
                          "GRENO PUBLIC SCHOOL",
                          "Gupta PU College",
                          "Harsha International public school",
                          "Indian Public School",
                          "Jnanasagara International Public School",
                          "Kalka Public School",
                          "Lilavati Lalji Dayal High School",
                          "Lilavati Lalji Dayal High School and College Of Commerce",
                          "Maria Niketan School of institutions",
                          "MORNING STAR PUBLIC SCHOOL",
                          "Mount Carmel Public School",
                          "Muni International School",
                          "Mysore West Lions Sevaniketan",
                          "Pict Model School",
                          "PNC Cognitio School",
                          "Police Modern School",
                          "Priyadarshini High School",
                          "Radcliff School",
                          "Raman Munjal Vidya Mandir",
                          "Reena Mehta Junior College of Arts, Science & Commerce",
                          "ROYAL ACADEMY PUBLIC SCHOOL",
                          "Rustomjee International School",
                          "Sahaj International School",
                          "St. Mary's English Public School",
                          "Saraswati vidya mandir",
                          "Seshadripuram High School",
                          "Seventh Day Adventist Senior Secondary School",
                          "Shivaji Shikshan Sanstha",
                          "SRSD Sr.Sec School Delhi",
                          "St Alousious School",
                          "St Antony's School",
                          "St. MEERA'S Public School",
                          "St. Ramanand English Medium High School",
                          "ST. ROCK'S GIRLS HIGH SCHOOL",
                          "St.Antony's School khora GZB",
                          "Suncity School",
                          "Vedas International School",
                          "Vidya School",
                          "VIDYA SPOORTHI SCHOOL",
                          "Vidyadeep Vidyalaya",
                          "Vishwa Bharti Public",
                          "Wisdom Era English Medium School",
                          "Wisdom Wings School"
                        ]
                          .filter((school) =>
                            school
                              .toLowerCase()
                              .includes(schoolInputValue.toLowerCase())
                          )
                          .map((school) => (
                            <CommandItem
                              key={school}
                              onSelect={() => {
                                handleInputChange("schoolName", school);
                                setSchoolInputValue(school);
                                setSchoolListVisible(false);
                              }}
                            >
                              {school}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  )}
                </Command>
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) =>
                      handleInputChange("city", e.target.value)
                    }
                    className="focus-ring"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) =>
                      handleInputChange("state", e.target.value)
                    }
                    className="focus-ring"
                    required
                  />
                </div>
              </div>

              {/* Grade and Board */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    type="number"
                    placeholder="10"
                    min="6"
                    max="12"
                    value={formData.grade}
                    onChange={(e) =>
                      handleInputChange("grade", e.target.value)
                    }
                    className="focus-ring"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="board">Board</Label>
                  <Input
                    id="board"
                    type="text"
                    placeholder="CBSE"
                    value={formData.board}
                    onChange={(e) =>
                      handleInputChange("board", e.target.value)
                    }
                    className="focus-ring"
                    required
                  />
                </div>
              </div>

               {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    className="focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    required
                    className="focus-ring"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 md:h-12 text-sm md:text-base font-semibold transition-smooth mt-4 md:mt-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>Create Account</>
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-4 md:mt-6">
              <Separator />
              <div className="text-center mt-3 md:mt-4">
                <p className="text-xs md:text-sm text-muted-foreground">
                  Already have an account?
                </p>
                <Button
                  variant="link"
                  asChild
                  className="text-primary font-semibold text-sm md:text-base"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <div className="text-center px-2">
          <p className="text-white/60 text-xs leading-relaxed">
            By creating an account, you agree to our privacy practices. Your
            data is secure and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;