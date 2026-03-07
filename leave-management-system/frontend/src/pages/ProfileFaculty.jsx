import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, BookOpen, Calendar, Heart, Users, Edit3, Save, X,
  Clock, GraduationCap, Phone, MapPin, Award, Briefcase,
} from "lucide-react";
import FacultyNavbar from "@/components/FacultyNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// ─── Timetable Constants ─────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const EMPTY_TIMETABLE = Object.fromEntries(
  DAYS.map(d => [d, Object.fromEntries(PERIODS.map(p => [p, ""]))])
);
const timeSlots = {
  1: "9:00–9:50",
  2: "9:50–10:40",
  3: "11:00–11:50",
  4: "11:50–12:40",
  5: "12:40–1:30",
  6: "2:15–3:05",
  7: "3:05–3:55",
  8: "3:55–4:45",
};

// ─── Main Component ─────────────────────────────
export default function FacultyProfile() {
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  // Profile state
  const [profile, setProfile] = useState(null);
  const [draftProfile, setDraftProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);

  // Timetable state
  const [timetable, setTimetable] = useState(EMPTY_TIMETABLE);
  const [draftTT, setDraftTT] = useState(EMPTY_TIMETABLE);
  const [editingTT, setEditingTT] = useState(false);

  // ─── Fetch profile & timetable ─────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/faculty/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setDraftProfile(res.data);
        if (res.data.timetable) setTimetable(res.data.timetable);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [token]);

  // ─── Profile Handlers ─────────────
  const startEditProfile = () => setEditingProfile(true);
  const cancelEditProfile = () => {
    setDraftProfile(profile);
    setEditingProfile(false);
  };
  const saveProfile = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/faculty/update",
        draftProfile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(draftProfile);
      setEditingProfile(false);
      toast({ title: "Profile updated", description: "Your details have been saved." });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save profile." });
    }
  };
  const handleProfileChange = (key, value) => {
    setDraftProfile(prev => ({ ...prev, [key]: value }));
  };

  // ─── Timetable Handlers ─────────────
  const startEditTT = () => {
    setDraftTT(JSON.parse(JSON.stringify(timetable)));
    setEditingTT(true);
  };
  const cancelEditTT = () => setEditingTT(false);
  const saveTT = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/faculty/timetable",
        { timetable: draftTT },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimetable(JSON.parse(JSON.stringify(draftTT)));
      setEditingTT(false);
      toast({ title: "Timetable saved", description: "Your weekly timetable has been updated." });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save timetable." });
    }
  };
  const handleTTChange = (day, period, value) => {
    setDraftTT(prev => ({
      ...prev,
      [day]: { ...prev[day], [period]: value }
    }));
  };

  const isRecess = (p) => p === 2;
  const isLunch = (p) => p === 5;

  // ─── Field Renderers ─────────────
  const field = (icon, label, key, type = "text") => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</Label>
      {editingProfile ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
          <Input
            type={type}
            value={draftProfile?.[key] || ""}
            onChange={e => handleProfileChange(key, e.target.value)}
            className="pl-10 h-10 border-slate-200 focus:border-teal-500"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-teal-600">{icon}</span>
          <span className="text-sm font-medium text-slate-900">{profile?.[key] || "—"}</span>
        </div>
      )}
    </div>
  );

  const selectField = (icon, label, key, options) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</Label>
      {editingProfile ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">{icon}</span>
          <Select value={draftProfile?.[key] || ""} onValueChange={v => handleProfileChange(key, v)}>
            <SelectTrigger className="pl-10 h-10 border-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-teal-600">{icon}</span>
          <span className="text-sm font-medium text-slate-900">{profile?.[key] || "—"}</span>
        </div>
      )}
    </div>
  );

  if (!profile) return (
    <>
      <FacultyNavbar />
      <div className="min-h-screen flex items-center justify-center pt-20 text-slate-500 animate-pulse font-medium">
        Loading profile details...
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <FacultyNavbar />
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your personal details and weekly timetable</p>
        </motion.div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 shadow-sm p-1 rounded-xl">
            <TabsTrigger value="details" className="gap-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 rounded-lg"><User className="w-4 h-4" /> Details</TabsTrigger>
            <TabsTrigger value="timetable" className="gap-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 rounded-lg"><Clock className="w-4 h-4" /> Timetable</TabsTrigger>
          </TabsList>

          {/* ═════════ DETAILS TAB ═════════ */}
          <TabsContent value="details">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 sm:p-8 space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                    <p className="text-sm text-slate-500">{profile.designation || "Faculty"} • {profile.department}</p>
                    <p className="text-xs text-slate-400 mt-0.5">ID: {profile.employeeId || "N/A"}</p>
                  </div>
                </div>
                {editingProfile ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={cancelEditProfile} className="hover:bg-slate-100"><X className="w-4 h-4 mr-1" /> Cancel</Button>
                    <Button size="sm" onClick={saveProfile} className="bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:opacity-90"><Save className="w-4 h-4 mr-1" /> Save</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={startEditProfile} className="border-slate-200 hover:bg-slate-50"><Edit3 className="w-4 h-4 mr-1" /> Edit Profile</Button>
                )}
              </div>

              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-teal-600" /> Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {field(<User className="w-4 h-4" />, "Full Name", "name")}
                  {field(<Mail className="w-4 h-4" />, "Email", "email")}
                  {field(<Phone className="w-4 h-4" />, "Phone", "phone")}
                  {selectField(<Users className="w-4 h-4" />, "Gender", "gender", [
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ])}
                  {field(<Calendar className="w-4 h-4" />, "Date of Birth", "dob", "date")}
                  {selectField(<Heart className="w-4 h-4" />, "Marital Status", "maritalStatus", [
                    { value: "Single", label: "Single" },
                    { value: "Married", label: "Married" },
                  ])}
                  {field(<MapPin className="w-4 h-4" />, "Address", "address")}
                </div>

                <h3 className="text-sm font-semibold text-slate-900 mt-8 mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-teal-600" /> Professional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {field(<Briefcase className="w-4 h-4" />, "Employee ID", "employeeId")}
                  {field(<Award className="w-4 h-4" />, "Designation", "designation")}
                  {field(<BookOpen className="w-4 h-4" />, "Department", "department")}
                  {field(<BookOpen className="w-4 h-4" />, "Subject Teaching", "subject")}
                  {field(<GraduationCap className="w-4 h-4" />, "Qualification", "qualification")}
                  {field(<Calendar className="w-4 h-4" />, "Joining Date", "joiningDate", "date")}
                  {field(<Clock className="w-4 h-4" />, "Experience", "experience")}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ═════════ TIMETABLE TAB ═════════ */}
          <TabsContent value="timetable">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Weekly Timetable</h2>
                  <p className="text-sm text-slate-500">Monday to Saturday • 8 periods per day</p>
                </div>
                {editingTT ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={cancelEditTT} className="hover:bg-slate-100"><X className="w-4 h-4 mr-1" /> Cancel</Button>
                    <Button size="sm" onClick={saveTT} className="bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:opacity-90"><Save className="w-4 h-4 mr-1" /> Save</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={startEditTT} className="border-slate-200 hover:bg-slate-50"><Edit3 className="w-4 h-4 mr-1" /> Edit Timetable</Button>
                )}
              </div>

              {/* Timetable grid */}
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr>
                      <th className="p-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left w-16">Day</th>
                      {PERIODS.map(p => (
                        <>
                          <th key={p} className="p-2 text-center">
                            <div className="text-xs font-semibold text-slate-900">P{p}</div>
                            <div className="text-[10px] text-slate-500">{timeSlots[p]}</div>
                          </th>
                          {isRecess(p) && <th key={`recess-${p}`} className="px-1 w-10"><div className="text-[10px] font-medium text-amber-700 bg-amber-50 rounded-md py-3 text-center leading-tight">R<br/>E<br/>C<br/>E<br/>S<br/>S</div></th>}
                          {isLunch(p) && <th key={`lunch-${p}`} className="px-1 w-10"><div className="text-[10px] font-medium text-teal-700 bg-teal-50 rounded-md py-3 text-center leading-tight">L<br/>U<br/>N<br/>C<br/>H</div></th>}
                        </>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr key={day} className="border-t border-slate-100">
                        <td className="p-2"><span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{day}</span></td>
                        {PERIODS.map(p => {
                          const currentTT = editingTT ? draftTT : timetable;
                          const val = currentTT[day]?.[p] || "";
                          return (
                            <>
                              <td key={`${day}-${p}`} className="p-1.5">
                                {editingTT ? (
                                  <Input value={draftTT[day]?.[p] || ""} onChange={e => handleTTChange(day, p, e.target.value)} placeholder="Subject" className="h-9 text-xs text-center px-1 min-w-[80px] border-slate-200 focus:border-teal-500" />
                                ) : (
                                  <div className={`h-9 flex items-center justify-center rounded-lg text-xs font-medium min-w-[80px] transition-colors ${val ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-slate-50 text-slate-400 border border-transparent"}`}>{val || "—"}</div>
                                )}
                              </td>
                              {isRecess(p) && <td key={`recess-${day}-${p}`} className="px-1"><div className="h-9 w-8" /></td>}
                              {isLunch(p) && <td key={`lunch-${day}-${p}`} className="px-1"><div className="h-9 w-8" /></td>}
                            </>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}