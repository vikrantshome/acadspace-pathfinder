/**
 * Sign-Up Page — Premium split-screen design matching Login page
 * Features: dynamic school list from API, state/city cascading dropdowns
 */

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Loader2,
  ArrowRight,
  User,
  Phone,
  Mail,
  Lock,
  School,
  MapPin,
  BookOpen,
  ChevronDown,
  Search,
  Check,
  Shield,
  Compass,
  Microscope,
  Code2,
  Palette,
  Stethoscope,
  Sparkles,
  Rocket,
  BrainCircuit,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import {
  getSortedStateEntries,
  getStateLabel,
  getCitiesForState,
  type StateEntry,
} from "@/data/india-locations";

/* ═══════════ Searchable Dropdown Component ═══════════ */
interface DropdownOption {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  required?: boolean;
  id: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  icon,
  label,
  required = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  const otherOption = options.find(o => o.value === "__other__" || o.value === "Other");

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5" ref={ref}>
      <Label htmlFor={id} className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground/80">
        {icon}
        {label}
      </Label>
      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => { setIsOpen(!isOpen); setSearch(""); }}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg border transition-all
            ${disabled ? "opacity-50 cursor-not-allowed bg-muted" : "bg-background hover:border-primary/40 cursor-pointer"}
            ${isOpen ? "border-primary ring-2 ring-primary/20" : "border-border"}
            ${!value ? "text-muted-foreground" : "text-foreground"}`}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-xl max-h-52 overflow-hidden">
            {options.length > 5 && (
              <div className="p-2 border-b border-border">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted">
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <div className="overflow-y-auto max-h-40">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-center text-muted-foreground">No results found</div>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-primary/5
                      ${value === option.value ? "bg-primary/10 text-primary font-medium" : "text-foreground"}`}
                  >
                    {value === option.value && <Check className="w-3.5 h-3.5" />}
                    <span className={value === option.value ? "" : "ml-5"}>{option.label}</span>
                  </button>
                ))
              )}
            </div>
            
            {/* Sticky 'Other' option at the bottom */}
            {otherOption && (
              <div className="border-t border-border p-1 bg-muted/20">
                <button
                  type="button"
                  onClick={() => {
                    onChange(otherOption.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 text-sm text-left transition-colors hover:bg-primary/5 rounded-md
                    ${value === otherOption.value ? "bg-primary/10 text-primary font-medium" : "text-foreground font-medium"}`}
                >
                  {value === otherOption.value && <Check className="w-3.5 h-3.5" />}
                  <span className={value === otherOption.value ? "" : "ml-5"}>{otherOption.label}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {required && <input type="text" required value={value} readOnly className="sr-only" tabIndex={-1} />}
    </div>
  );
};

/* ═══════════ Board Options ═══════════ */
const BOARD_OPTIONS: DropdownOption[] = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE / ISC" },
  { value: "State Board", label: "State Board" },
  { value: "IB", label: "IB (International Baccalaureate)" },
  { value: "IGCSE", label: "IGCSE / Cambridge" },
  { value: "NIOS", label: "NIOS" },
  { value: "Other", label: "Other" },
];

/* ═══════════ Component ═══════════ */
interface SignUpProps {
  onSwitchMode?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchMode }) => {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Schools
  const [schools, setSchools] = useState<string[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [customSchoolName, setCustomSchoolName] = useState("");

  // Location
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [customCity, setCustomCity] = useState("");

  // Board
  const [customBoard, setCustomBoard] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    parentName: "",
    grade: "",
    board: "",
    mobileNo: "",
  });

  // Pre-fill from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mobileNo = params.get("mobileNo");
    if (mobileNo) {
      setFormData((prev) => ({ ...prev, mobileNo }));
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // Fetch schools from API
  useEffect(() => {
    const fetchSchools = async () => {
      setSchoolsLoading(true);
      try {
        const list = await apiService.getSchools();
        setSchools(list || []);
      } catch {
        setSchools([]);
      } finally {
        setSchoolsLoading(false);
      }
    };
    fetchSchools();
  }, []);

  // State entries for dropdown
  const stateEntries = getSortedStateEntries();
  const stateOptions: DropdownOption[] = stateEntries.map((s: StateEntry) => ({
    value: s.name,
    label: getStateLabel(s),
  }));

  // City options (cascading on state)
  const cityList = selectedState ? getCitiesForState(selectedState) : [];
  const cityOptions: DropdownOption[] = [
    ...cityList.map((c) => ({ value: c, label: c })),
    { value: "__other__", label: "Other — Enter city name" },
  ];

  // School options
  const schoolOptions: DropdownOption[] = [
    ...schools.map((s) => ({ value: s, label: s })),
    { value: "__other__", label: "Other — Enter school name" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity("");
    setCustomCity("");
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    if (value !== "__other__") setCustomCity("");
  };

  const handleSchoolChange = (value: string) => {
    setSelectedSchool(value);
    if (value !== "__other__") setCustomSchoolName("");
  };

  const handleBoardChange = (value: string) => {
    handleInputChange("board", value);
    if (value !== "Other") setCustomBoard("");
  };

  const handleSignUp = async () => {
    const finalSchool = selectedSchool === "__other__" ? customSchoolName : selectedSchool;
    const finalCity = selectedCity === "__other__" ? customCity : selectedCity;
    const finalBoard = formData.board === "Other" ? customBoard : formData.board;

    setLoading(true);
    try {
      const grade = formData.grade ? parseInt(formData.grade, 10) : undefined;
      await signUp(
        formData.email,
        "123456", // Default hardcoded password
        formData.fullName,
        formData.fullName,
        formData.parentName,
        finalSchool,
        grade,
        finalBoard,
        formData.mobileNo,
        finalCity,
        selectedState
      );
      navigate("/");
    } catch (error: any) {
      // Error handling done in AuthProvider
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignUp();
  };

  /* ═══════════ Render ═══════════ */
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-background overflow-y-auto animate-fade-in custom-scrollbar">
      <div className="w-full max-w-[520px] space-y-5">
        
        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Create Account
          </h2>
          <p className="text-sm text-muted-foreground">Fill in your details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Parent Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground/80">
                <User className="w-3.5 h-3.5" /> Full Name
              </Label>
              <Input id="fullName" type="text" placeholder="Your full name" value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)} required
                className="h-10 text-sm rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parentName" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground/80">
                <User className="w-3.5 h-3.5" /> Parent Name
              </Label>
              <Input id="parentName" type="text" placeholder="Your parent's name" value={formData.parentName}
                onChange={(e) => handleInputChange("parentName", e.target.value)} required
                className="h-10 text-sm rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Email & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground/80">
                <Mail className="w-3.5 h-3.5" /> Email Address (Optional)
              </Label>
              <Input id="email" type="email" placeholder="your.email@example.com" value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="h-10 text-sm rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobileNo" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground/80">
                <Phone className="w-3.5 h-3.5" /> Mobile Number
              </Label>
              <Input id="mobileNo" type="tel" placeholder="10-digit mobile number" value={formData.mobileNo}
                onChange={(e) => handleInputChange("mobileNo", e.target.value.replace(/\D/g, "").slice(0, 10))} required
                className="h-10 text-sm rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* School Name */}
          <div>
            <SearchableDropdown
              id="schoolName"
              label="School / College Name"
              icon={<School className="w-3.5 h-3.5" />}
              options={schoolOptions}
              value={selectedSchool}
              onChange={handleSchoolChange}
              placeholder={schoolsLoading ? "Loading schools..." : "Select your school"}
              disabled={schoolsLoading}
              required
            />
            {selectedSchool === "__other__" && (
              <Input
                type="text"
                placeholder="Enter your school / college name"
                value={customSchoolName}
                onChange={(e) => setCustomSchoolName(e.target.value)}
                required
                className="mt-2 h-10 text-sm rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            )}
          </div>

          {/* State & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SearchableDropdown
              id="state"
              label="State"
              icon={<MapPin className="w-3.5 h-3.5" />}
              options={stateOptions}
              value={selectedState}
              onChange={handleStateChange}
              placeholder="Select state"
              required
            />
            <div>
              <SearchableDropdown
                id="city"
                label="City"
                icon={<MapPin className="w-3.5 h-3.5" />}
                options={cityOptions}
                value={selectedCity}
                onChange={handleCityChange}
                placeholder={selectedState ? "Select city" : "Select state first"}
                disabled={!selectedState}
                required
              />
              {selectedCity === "__other__" && (
                <Input
                  type="text"
                  placeholder="Enter your city name"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  required
                  className="mt-2 h-10 text-sm rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          </div>

          {/* Grade & Board */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="grade" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground/80">
                <BookOpen className="w-3.5 h-3.5" /> Grade / Year
              </Label>
              <Input id="grade" type="number" placeholder="e.g. 10" min="1" max="12" value={formData.grade}
                onChange={(e) => handleInputChange("grade", e.target.value)} required
                className="h-10 text-sm rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <SearchableDropdown
                id="board"
                label="Board"
                icon={<BookOpen className="w-3.5 h-3.5" />}
                options={BOARD_OPTIONS}
                value={formData.board}
                onChange={handleBoardChange}
                placeholder="Select board"
                required
              />
              {formData.board === "Other" && (
                <Input
                  type="text"
                  placeholder="Enter your board name"
                  value={customBoard}
                  onChange={(e) => setCustomBoard(e.target.value)}
                  required
                  className="mt-2 h-10 text-sm rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all
              bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider + Sign In link */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">OR</span></div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              if (onSwitchMode) onSwitchMode();
              else navigate('/login');
            }}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Already have an account? Sign In
          </button>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>Your data is secure &amp; never shared with third parties</span>
        </div>
      </div>
    </div>
  );
};

export default SignUp;