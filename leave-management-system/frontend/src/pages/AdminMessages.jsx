import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Megaphone,
  Send,
  MessageSquare,
  User,
  Clock,
  Trash2,
  Pin,
  AlertCircle,
  Info,
  PartyPopper,
  Lock,
  Plus,
  Loader2,
} from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORY_CONFIG = {
  general: { label: "General", icon: Info, badgeClass: "bg-blue-50 text-blue-700 border-blue-100" },
  "leave-lock": { label: "Leave Lock", icon: Lock, badgeClass: "bg-amber-50 text-amber-700 border-amber-100" },
  fest: { label: "Fest / Event", icon: PartyPopper, badgeClass: "bg-purple-50 text-purple-700 border-purple-100" },
  exam: { label: "Exam Period", icon: AlertCircle, badgeClass: "bg-rose-50 text-rose-700 border-rose-100" },
  urgent: { label: "Urgent", icon: AlertCircle, badgeClass: "bg-red-50 text-red-700 border-red-100" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export default function AdminMessages() {
  const token = localStorage.getItem("token");
  const [messages, setMessages] = useState([]);
  const [realHODs, setRealHODs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Form state
  const [msgType, setMsgType] = useState("broadcast");
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [recipientDept, setRecipientDept] = useState("");

  useEffect(() => {
    fetchMessages();
    fetchRealHODs();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/messages/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealHODs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/faculty/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hodList = res.data.filter((f) => f.role?.toUpperCase() === "HOD");
      setRealHODs(hodList);
    } catch (err) {
      console.error("Error fetching HODs", err);
    }
  };

  const resetForm = () => {
    setMsgType("broadcast");
    setCategory("general");
    setTitle("");
    setContent("");
    setRecipientDept("");
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      const selectedHOD = realHODs.find((h) => h.department === recipientDept);
      const payload = {
        type: msgType,
        category,
        title: title.trim(),
        content: content.trim(),
        recipientDept: msgType === "direct" ? recipientDept : undefined,
        recipientName: msgType === "direct" ? selectedHOD?.name : undefined,
      };

      await axios.post("http://localhost:5000/api/messages/send", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchMessages();
      resetForm();
      setDialogOpen(false);
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const togglePin = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/messages/pin/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  const filtered = messages
    .filter((m) => {
      if (activeTab === "broadcast") return m.type === "broadcast";
      if (activeTab === "direct") return m.type === "direct";
      if (activeTab === "pinned") return m.pinned;
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const broadcastCount = messages.filter((m) => m.type === "broadcast").length;
  const directCount = messages.filter((m) => m.type === "direct").length;
  const pinnedCount = messages.filter((m) => m.pinned).length;

  return (
    <>
      <AdminNavbar />

      <div className="min-h-screen bg-slate-50 pt-24 pb-12">
        {/* Decorative Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl" />
          <div className="absolute bottom-20 -left-32 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Messages & Announcements
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Communicate important updates to HODs across departments
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-100">
                  <Plus className="w-4 h-4" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-teal-700 font-bold">
                    <Send className="w-5 h-5" />
                    Compose Message
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                      <Select value={msgType} onValueChange={(v) => { setMsgType(v); setRecipientDept(""); }}>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="broadcast">
                            <span className="flex items-center gap-2">
                              <Megaphone className="w-3.5 h-3.5 text-teal-600" /> Broadcast
                            </span>
                          </SelectItem>
                          <SelectItem value="direct">
                            <span className="flex items-center gap-2">
                              <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Direct
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                      <Select value={category} onValueChange={(v) => setCategory(v)}>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                <cfg.icon className="w-3.5 h-3.5" /> {cfg.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {msgType === "direct" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Recipient HOD</label>
                      <Select value={recipientDept} onValueChange={setRecipientDept}>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {realHODs.map((hod) => (
                            <SelectItem key={hod._id} value={hod.department}>
                              {hod.name} ({hod.department})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                    <Input
                      className="bg-slate-50 border-slate-200"
                      placeholder="e.g. Leave Lock for Mid-Sems"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                    <Textarea
                      className="bg-slate-50 border-slate-200"
                      placeholder="Write your message here..."
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={!title.trim() || !content.trim() || (msgType === "direct" && !recipientDept)}
                    className="w-full gap-2 bg-teal-600 hover:bg-teal-700 py-6 font-bold"
                  >
                    <Send className="w-4 h-4" />
                    Send Announcement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { label: "Broadcasts", count: broadcastCount, icon: Megaphone, color: "text-teal-600", bg: "bg-teal-50" },
              { label: "Direct Msgs", count: directCount, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Pinned", count: pinnedCount, icon: Pin, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 leading-tight">{s.count}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Main Content Area */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-200/50 p-1 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-white">All ({messages.length})</TabsTrigger>
                <TabsTrigger value="broadcast" className="data-[state=active]:bg-white">Broadcasts</TabsTrigger>
                <TabsTrigger value="direct" className="data-[state=active]:bg-white">Direct</TabsTrigger>
                <TabsTrigger value="pinned" className="data-[state=active]:bg-white text-amber-600">Pinned</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 focus-visible:outline-none">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <div className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
                      <p className="text-slate-400 mt-2 text-sm">Syncing with server...</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                      <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium">No messages here yet.</p>
                    </motion.div>
                  ) : (
                    filtered.map((msg, i) => {
                      const catCfg = CATEGORY_CONFIG[msg.category] || CATEGORY_CONFIG.general;
                      return (
                        <motion.div
                          key={msg._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.03 }}
                          className={`bg-white rounded-2xl border shadow-sm p-6 relative group transition-all hover:shadow-md ${
                            msg.pinned ? "border-amber-200 bg-amber-50/10" : "border-slate-200"
                          }`}
                        >
                          {msg.pinned && (
                            <div className="absolute top-0 right-0 p-2 bg-amber-500 rounded-bl-xl shadow-md">
                              <Pin className="w-3.5 h-3.5 text-white fill-white" />
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <Badge variant="outline" className={`px-2 py-0.5 text-[10px] uppercase font-bold border-none ${catCfg.badgeClass}`}>
                                  <catCfg.icon className="w-3 h-3 mr-1" />
                                  {catCfg.label}
                                </Badge>
                                <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                  })}
                                </span>
                              </div>

                              <h4 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{msg.title}</h4>
                              <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{msg.content}</p>

                              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.type === 'broadcast' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {msg.type === 'broadcast' ? 'B' : 'D'}
                                </div>
                                {msg.type === "broadcast" ? "All HODs" : `${msg.recipientName} (${msg.recipientDept})`}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => togglePin(msg._id)}
                                className={`p-2 rounded-xl transition-all ${
                                  msg.pinned ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400 hover:text-amber-600"
                                }`}
                                title="Pin"
                              >
                                <Pin className={`w-4 h-4 ${msg.pinned ? 'fill-amber-600' : ''}`} />
                              </button>
                              <button
                                onClick={() => deleteMessage(msg._id)}
                                className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
}