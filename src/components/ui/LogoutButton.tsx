'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch (error: any) {
      console.error('Logout error', error)
      toast.error('Failed to log out')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout} 
      disabled={isLoggingOut}
      className="w-full justify-start gap-3 mt-4 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10"
    >
      {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      Log Out
    </Button>
  )
}
