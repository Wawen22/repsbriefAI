'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Users, 
  Crown, 
  ChevronRight, 
  CheckCircle2, 
  UserPlus, 
  Loader2, 
  Palette, 
  Image as ImageIcon,
  Save,
  ExternalLink,
  Upload,
  Orbit,
  Zap,
  FileText,
  Star,
  Sparkles,
  ArrowUpRight,
  ArrowRight
} from "lucide-react"
import { getUserTeamsAction, switchTeamAction, updateTeamBrandingAction } from "@/app/actions/team"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { InviteMemberModal } from "./InviteMemberModal"

type Team = {
  id: string;
  name: string;
  owner_id: string;
  role: string;
  logo_url?: string;
  primary_color?: string;
}

export function TeamWorkspaceSettings() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null)
  const [plan, setPlan] = useState<string>('starter')
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState<string | null>(null)
  const [isSavingBranding, setIsSavingBranding] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Branding states
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await getUserTeamsAction()
      const teamsData = res.teams as unknown as Team[]
      setTeams(teamsData)
      setCurrentTeamId(res.currentTeamId)
      setPlan(res.plan)
      
      const currentTeam = teamsData.find(t => t.id === res.currentTeamId)
      if (currentTeam) {
        setLogoUrl(currentTeam.logo_url || '')
        setPrimaryColor(currentTeam.primary_color || '#3b82f6')
      }
      
      setIsLoading(false)
    }
    load()
  }, [])

  const handleSwitch = async (teamId: string) => {
    if (teamId === currentTeamId) return
    setIsSwitching(teamId)
    const tid = toast.loading("Switching workspace...")
    try {
      const res = await switchTeamAction(teamId)
      if (res.success) {
        setCurrentTeamId(teamId)
        toast.success("Workspace switched!", { id: tid })
        window.location.reload()
      } else {
        toast.error(res.error || "Failed to switch", { id: tid })
      }
    } catch (e) {
      toast.error("Something went wrong", { id: tid })
    } finally {
      setIsSwitching(null)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentTeamId) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB")
      return
    }

    setIsUploading(true)
    const tid = toast.loading("Uploading logo...")

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${currentTeamId}/logo-${Math.random()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      setLogoUrl(publicUrl)
      toast.success("Logo uploaded!", { id: tid })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown upload error"
      toast.error(`Upload failed: ${message}`, { id: tid })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveBranding = async () => {
    setIsSavingBranding(true)
    const tid = toast.loading("Saving branding settings...")
    try {
      const res = await updateTeamBrandingAction(logoUrl, primaryColor)
      if (res.success) {
        toast.success("Agency branding updated!", { id: tid })
      } else {
        toast.error(res.error || "Failed to update", { id: tid })
      }
    } catch (e) {
      toast.error("Something went wrong", { id: tid })
    } finally {
      setIsSavingBranding(false)
    }
  }

  const isTeamPlan = plan === 'team'
  const activeTeam = teams.find(t => t.id === currentTeamId)
  const canEditBranding = activeTeam && ['admin', 'owner'].includes(activeTeam.role)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-10 text-left">
      {/* Workspace Switcher */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Your Workspaces</h3>
        <div className="grid gap-3">
          {teams.map((team) => {
            const isActive = team.id === currentTeamId
            return (
              <button
                key={team.id}
                onClick={() => handleSwitch(team.id)}
                disabled={!!isSwitching}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-[2rem] border transition-all text-left group",
                  isActive 
                    ? "bg-blue-500/10 border-blue-500/30" 
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-4 text-left">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-12 h-12 rounded-2xl object-contain bg-white/5 p-1" />
                  ) : (
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg",
                      isActive ? "bg-blue-500 text-white shadow-xl shadow-blue-500/20" : "bg-white/5 text-slate-400"
                    )}>
                      {team.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className={cn("font-bold text-base tracking-tight", isActive ? "text-white" : "text-slate-300")}>
                      {team.name}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                      Role: {team.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-left">
                  {isActive && (
                    <Badge variant="outline" className="text-blue-400 border-blue-500/20 bg-blue-500/5 text-[9px] uppercase tracking-widest font-black hidden sm:flex px-3 py-1">
                      Active
                    </Badge>
                  )}
                  {isSwitching === team.id ? (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  ) : (
                    <ChevronRight className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-slate-700 group-hover:text-slate-400")} />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Agency White-labeling Section */}
      <section className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Agency Branding</h3>
            <p className="text-[11px] text-slate-500 font-medium pl-1">Customize how your clients see shared strategies.</p>
          </div>
          {isTeamPlan && (
             <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                Pro Feature Active
             </Badge>
          )}
        </div>

        {!isTeamPlan ? (
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 flex flex-col items-center text-center gap-6">
            <div className="p-4 rounded-[1.5rem] bg-blue-500/10 border border-blue-500/20">
               <Palette className="w-8 h-8 text-blue-400" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h4 className="text-lg font-bold text-white tracking-tight">White-label Strategy Pages</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Upgrade to the <b>Team Plan</b> to replace RepsBrief branding with your agency logo and colors on all shared strategy briefs.
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest">
              Upgrade to Team
            </Button>
          </div>
        ) : !canEditBranding ? (
          <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center gap-4">
             <Crown className="w-5 h-5 text-amber-500/50" />
             <p className="text-xs text-slate-500 font-medium">Only workspace owners or admins can modify branding settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Agency Logo</Label>
                    <div className="flex items-center gap-4">
                       <div className="w-20 h-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-700" />
                          )}
                       </div>
                       <div className="flex-1 space-y-3">
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden" 
                            accept="image/*"
                          />
                          <div className="flex gap-2">
                             <Button 
                               variant="outline" 
                               onClick={() => fileInputRef.current?.click()}
                               disabled={isUploading}
                               className="rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest h-10 px-4"
                             >
                                {isUploading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
                                Upload Image
                             </Button>
                             {logoUrl && (
                               <Button 
                                 variant="ghost" 
                                 onClick={() => setLogoUrl('')}
                                 className="rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-4 text-rose-500 hover:text-rose-400 hover:bg-rose-500/5"
                               >
                                  Remove
                               </Button>
                             )}
                          </div>
                          <p className="text-[9px] text-slate-600">PNG or JPG, max 2MB. Recommended: Transparent background.</p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Brand Accent Color</Label>
                    <div className="flex gap-3">
                       <Input 
                         type="color"
                         value={primaryColor}
                         onChange={(e) => setPrimaryColor(e.target.value)}
                         className="w-12 h-12 p-1 rounded-xl bg-white/5 border-white/10 cursor-pointer"
                       />
                       <Input 
                         value={primaryColor}
                         onChange={(e) => setPrimaryColor(e.target.value)}
                         placeholder="#3b82f6"
                         className="bg-black/40 border-white/10 rounded-2xl h-12 text-sm font-mono flex-1"
                       />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveBranding}
                  disabled={isSavingBranding || isUploading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full h-12 font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-blue-500/20"
                >
                  {isSavingBranding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Branding
                </Button>
             </div>

             <div className="space-y-4">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Live Preview</Label>
                
                {/* INTERACTIVE PREVIEW CARD */}
                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full relative rounded-[2rem] border border-white/5 bg-[#050505] overflow-hidden aspect-video group text-left">
                       <div className="absolute inset-0 flex flex-col">
                          <div className="h-10 border-b border-white/5 bg-black/40 px-4 flex items-center justify-between">
                             {logoUrl ? (
                               <img src={logoUrl} alt="Logo Preview" className="h-5 object-contain" />
                             ) : (
                               <div className="flex items-center gap-1.5">
                                  <div className="w-4 h-4 rounded bg-blue-600" style={{ backgroundColor: primaryColor }} />
                                  <div className="h-2 w-16 bg-white/10 rounded-full" />
                               </div>
                             )}
                             <div className="h-4 w-4 rounded-full bg-white/5" />
                          </div>
                          <div className="p-6 space-y-4">
                             <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                             <div className="grid grid-cols-2 gap-3">
                                <div className="h-16 rounded-2xl bg-white/[0.03] border border-white/5 p-3 flex flex-col gap-2">
                                   <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: `${primaryColor}33` }} />
                                   <div className="h-1.5 w-2/3 bg-white/5 rounded-full" />
                                </div>
                                <div className="h-16 rounded-2xl bg-white/[0.03] border border-white/5 p-3 flex flex-col gap-2">
                                   <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: `${primaryColor}33` }} />
                                   <div className="h-1.5 w-2/3 bg-white/5 rounded-full" />
                                </div>
                             </div>
                             <div className="h-8 rounded-full w-full" style={{ backgroundColor: primaryColor }} />
                          </div>
                       </div>
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <Badge className="bg-white text-black font-black text-[10px] uppercase tracking-widest py-1.5 px-4 rounded-full flex items-center gap-2">
                            <ExternalLink className="w-3 h-3" />
                            Expand Preview
                          </Badge>
                       </div>
                    </button>
                  </DialogTrigger>

                  <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[90vh] overflow-y-auto p-0 bg-[#050505] border-white/10 rounded-[3rem] custom-scrollbar">
                     <DialogHeader className="sr-only">
                        <DialogTitle>Strategy Share Preview</DialogTitle>
                     </DialogHeader>

                     {/* FULL PAGE PREVIEW CONTENT */}
                     <div className="relative min-h-[120vh] text-white overflow-hidden pb-20">
                        {/* Background Decor */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div 
                            className="absolute top-[-5%] right-[-5%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20" 
                            style={{ backgroundColor: primaryColor }}
                          />
                          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
                        </div>

                        {/* Navbar */}
                        <div className="sticky top-0 z-50 h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl px-10 flex items-center justify-between">
                           {logoUrl ? (
                             <img src={logoUrl} alt="Logo" className="h-10 object-contain" />
                           ) : (
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: primaryColor }}>
                                   <Orbit className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-black text-lg tracking-tighter uppercase">{activeTeam?.name}</span>
                             </div>
                           )}
                           <Button size="sm" className="bg-white text-black rounded-full font-black px-6 text-[10px] uppercase tracking-widest h-10">
                              Try RepsBrief <ArrowUpRight className="ml-2 w-3.5 h-3.5" />
                           </Button>
                        </div>

                        <div className="relative z-10 max-w-4xl mx-auto px-10 py-20 space-y-16">
                           <header className="space-y-8 text-center">
                              <div className="flex justify-center gap-3">
                                 <Badge variant="outline" className="text-[10px] uppercase font-black px-4 py-1.5 border-none" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                   Exclusive Strategy
                                 </Badge>
                              </div>
                              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                                Your Trending <br /> Content Strategy
                              </h1>
                              <div className="flex items-center justify-center gap-4 pt-6">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-2xl text-white border border-white/10" style={{ backgroundColor: primaryColor }}>
                                  {activeTeam?.name[0].toUpperCase()}
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Strategic Brief by</p>
                                  <p className="text-lg font-bold text-white tracking-tight">{activeTeam?.name}</p>
                                </div>
                              </div>
                           </header>

                           <div className="space-y-8">
                              <div className="flex items-center justify-center gap-3">
                                <Zap className="w-5 h-5" style={{ color: primaryColor }} />
                                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">The Opening Hook</h4>
                              </div>
                              <div className="p-16 rounded-[4rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden text-center shadow-2xl">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                                <p className="text-4xl md:text-5xl font-bold italic text-white leading-tight">
                                  &ldquo;This is a preview of your custom-branded hook.&rdquo;
                                </p>
                              </div>
                           </div>

                           <div className="pt-20 text-center">
                              <div className="inline-block p-1 rounded-[3rem]" style={{ backgroundColor: primaryColor }}>
                                <div className="bg-[#050505] rounded-[2.8rem] px-16 py-16 space-y-8">
                                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Ready to Scale?</h3>
                                  <Button className="text-white rounded-full font-black px-12 h-16 text-xs uppercase tracking-widest shadow-2xl" style={{ backgroundColor: primaryColor }}>
                                    Start Your Studio <ArrowRight className="ml-3 w-5 h-5" />
                                  </Button>
                                </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </DialogContent>
                </Dialog>
                
                <p className="text-[10px] text-slate-600 italic text-center">Click the card to see the full page preview.</p>
             </div>
          </div>
        )}
      </section>

      {/* Team Management */}
      <section className="pt-6 border-t border-white/5 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Team Access</h3>
          <p className="text-[11px] text-slate-500 font-medium pl-1">Manage who can collaborate in this workspace.</p>
        </div>
        
        {!isTeamPlan ? (
          <div className="p-8 rounded-[2.5rem] bg-black/50 border border-white/5 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="p-3 rounded-2xl bg-amber-500/10 shrink-0">
               <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Multi-player Mode Locked</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                Add editors, strategists, or clients to your workspace. The Team Plan unlocks real-time collaboration.
              </p>
            </div>
            <Button variant="outline" className="rounded-full border-white/10 text-white font-bold text-xs uppercase tracking-widest h-10 px-6">
               Upgrade
            </Button>
          </div>
        ) : (
          <InviteMemberModal />
        )}
      </section>
    </div>
  )
}
