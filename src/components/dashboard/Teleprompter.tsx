'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Type, 
  Zap, 
  Maximize2, 
  Camera,
  Smartphone,
  ArrowRight,
  Timer,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface TeleprompterProps {
  title: string
  script: string
  onClose: () => void
}

export function Teleprompter({ title, script, onClose }: TeleprompterProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [speed, setSpeed] = useState(30) // 1-100
  const [fontSize, setFontSize] = useState(42) // px
  const scrollRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const scrollPosRef = useRef<number>(0)

  function animate(time: number) {
    if (lastTimeRef.current !== null && isPlaying && scrollRef.current) {
      const deltaTime = time - lastTimeRef.current
      const increment = (speed / 40) * (deltaTime / 16.67)
      scrollPosRef.current += increment
      scrollRef.current.scrollTop = scrollPosRef.current
    }
    lastTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    // Hide Command Palette indicator when prompter is active
    const cmdPill = document.getElementById('command-palette-indicator')
    if (cmdPill) cmdPill.style.display = 'none'

    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current)
      // Restore Command Palette indicator
      if (cmdPill) cmdPill.style.display = 'block'
    }
  }, [isPlaying, speed])

  const startWithCountdown = () => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval)
          setIsPlaying(true)
          return null
        }
        return prev ? prev - 1 : null
      })
    }, 1000)
  }

  const handleReset = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
      scrollPosRef.current = 0
    }
    setIsPlaying(false)
    setCountdown(null)
  }

  const handleScroll = () => {
    if (scrollRef.current && !isPlaying) {
      scrollPosRef.current = scrollRef.current.scrollTop
    }
  }

  if (typeof window === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[20000] bg-black flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      
      {/* Consistent Header Architecture */}
      <div className="h-24 md:h-20 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 md:px-12 flex items-center justify-between relative z-[20010]">
        <div className="flex items-center gap-4">
           <Button 
             variant="ghost" 
             onClick={onClose}
             className="h-11 pl-2 pr-5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all gap-3 group/back"
           >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover/back:bg-blue-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Back to Strategy</span>
           </Button>
           <div className="hidden lg:flex items-center gap-3 ml-4">
              <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live Recording Mode</span>
              </div>
           </div>
        </div>
        
        {/* Stylized Close Button matching Strategy view */}
        <button 
          onClick={onClose}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-2xl active:scale-95"
        >
          <X className="w-6 h-6 relative z-10" />
          <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Main Experience */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-black">
        
        {/* Mirror Line (Where to read) */}
        <div className="absolute top-1/3 left-0 right-0 h-40 pointer-events-none z-20 flex items-center justify-center">
           <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] via-blue-500/10 to-blue-500/[0.02] backdrop-blur-[1px]" />
           <div className="absolute left-4 md:left-10">
              <div className="flex flex-col items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse" />
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] [writing-mode:vertical-lr]">FOCUS</span>
              </div>
           </div>
           <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent self-end" />
        </div>

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in zoom-in duration-300">
             <div className="text-[15rem] font-black text-white italic animate-bounce drop-shadow-[0_0_50px_rgba(59,130,246,0.6)]">
                {countdown}
             </div>
          </div>
        )}

        {/* Script Content */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 sm:px-24 md:px-48 lg:px-80 py-[45vh] custom-scrollbar selection:bg-blue-500/30"
          style={{ scrollBehavior: 'auto' }}
        >
          <div 
            className="text-white leading-[1.5] font-black text-center transition-all whitespace-pre-wrap drop-shadow-2xl"
            style={{ fontSize: `${fontSize}px` }}
          >
            {script}
          </div>
          <div className="h-[60vh] flex flex-col items-center justify-center">
             <div className="w-px h-32 bg-gradient-to-b from-blue-500/50 to-transparent" />
             <span className="text-[12px] font-black text-slate-700 uppercase tracking-[0.8em] mt-6">End of Strategy</span>
          </div>
        </div>

        {/* Focus Gradients */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Control Center */}
      <div className="bg-black/90 border-t border-white/10 p-8 pb-14 md:pb-10 backdrop-blur-3xl relative z-[20020] shadow-[0_-30px_60px_rgba(0,0,0,0.8)]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Action Group */}
          <div className="shrink-0 flex items-center gap-8">
             <Button 
               variant="outline" 
               size="icon" 
               className="h-14 w-14 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all shadow-xl"
               onClick={handleReset}
             >
                <RotateCcw className="w-6 h-6" />
             </Button>

             <button 
               onClick={startWithCountdown}
               className={cn(
                 "h-24 w-24 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative group",
                 isPlaying 
                  ? "bg-white text-black hover:bg-slate-200" 
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/40"
               )}
             >
                <div className={cn(
                  "absolute inset-0 rounded-full bg-inherit animate-ping opacity-20",
                  isPlaying ? "hidden" : "block"
                )} />
                {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current ml-1.5" />}
             </button>

             <div className="flex flex-col items-center gap-2 group cursor-not-allowed opacity-30 text-white">
                <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                   <Camera className="w-6 h-6 text-slate-500" />
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Rec Link</span>
             </div>
          </div>

          {/* Settings Group */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-12 w-full text-white">
            {/* Speed */}
            <div className="space-y-5">
               <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                     <Zap className="w-4 h-4 text-blue-400" />
                     <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Scroll Tempo</span>
                  </div>
                  <span className="text-xs font-mono font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{speed}%</span>
               </div>
               <div className="flex items-center gap-5">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-white/10 bg-white/5 shrink-0 text-white" onClick={() => setSpeed(Math.max(0, speed - 5))}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Slider 
                    value={[speed]} 
                    onValueChange={(v) => { setSpeed(v[0]) }} 
                    max={100} 
                    step={1}
                    className="flex-1 cursor-pointer"
                  />
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-white/10 bg-white/5 shrink-0 text-white" onClick={() => setSpeed(Math.min(100, speed + 5))}>
                    <Plus className="w-4 h-4" />
                  </Button>
               </div>
            </div>

            {/* Font */}
            <div className="space-y-5">
               <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                     <Type className="w-4 h-4 text-purple-400" />
                     <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Text Density</span>
                  </div>
                  <span className="text-xs font-mono font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{fontSize}px</span>
               </div>
               <div className="flex items-center gap-5">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-white/10 bg-white/5 shrink-0 text-white" onClick={() => setFontSize(Math.max(16, fontSize - 4))}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Slider 
                    value={[fontSize]} 
                    onValueChange={(v) => setFontSize(v[0])} 
                    min={16}
                    max={100} 
                    step={2}
                    className="flex-1 cursor-pointer"
                  />
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-white/10 bg-white/5 shrink-0 text-white" onClick={() => setFontSize(Math.min(100, fontSize + 4))}>
                    <Plus className="w-4 h-4" />
                  </Button>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", className)}>
      {children}
    </span>
  )
}
