'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  UserCircle,
  Settings,
  Menu,
  LogOut,
  ChevronDown,
  Monitor,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface UserInfo {
  id: string
  email: string
  nome: string
  role: 'admin' | 'atendente'
}

// All navigation items
const allNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin'], // Only admin
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: Users,
    roles: ['admin', 'atendente'], // Both
  },
  {
    name: 'Perguntas',
    href: '/perguntas',
    icon: FileText,
    roles: ['admin'], // Only admin
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: MessageSquare,
    roles: ['admin', 'atendente'], // Both
  },
  {
    name: 'Profissionais',
    href: '/profissionais',
    icon: UserCircle,
    roles: ['admin'], // Only admin
  },
  {
    name: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
    roles: ['admin'], // Only admin
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserInfo()
  }, [])

  async function loadUserInfo() {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Try to get equipe info
        const { data: equipeData } = await supabase
          .from('form_equipe')
          .select('*')
          .eq('id', user.id)
          .single()

        if (equipeData) {
          setUserInfo({
            id: user.id,
            email: user.email || '',
            nome: equipeData.nome || user.email?.split('@')[0] || 'Usuário',
            role: (equipeData.role as 'admin' | 'atendente') || 'atendente',
          })
        } else {
          // User doesn't have equipe record - create one with admin role if it's the first user
          // For now, default to atendente
          setUserInfo({
            id: user.id,
            email: user.email || '',
            nome: user.email?.split('@')[0] || 'Usuário',
            role: 'atendente',
          })
        }
      }
    } catch (error) {
      console.error('Error loading user info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter navigation based on user role
  const navigation = allNavigation.filter(item =>
    userInfo?.role && item.roles.includes(userInfo.role)
  )

  // Check if current page is allowed for user's role
  useEffect(() => {
    if (!isLoading && userInfo) {
      const currentNavItem = allNavigation.find(item =>
        pathname === item.href || pathname.startsWith(item.href + '/')
      )

      if (currentNavItem && !currentNavItem.roles.includes(userInfo.role)) {
        // Redirect to first allowed page
        const firstAllowed = allNavigation.find(item => item.roles.includes(userInfo.role))
        if (firstAllowed) {
          router.push(firstAllowed.href)
        }
      }
    }
  }, [pathname, userInfo, isLoading, router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Atendente'
  }

  return (
    <div className="min-h-screen bg-seda/30">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-nude/30 bg-white lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-nude/30 px-6">
          <Image
            src="/images/logo.png"
            alt="Felice"
            width={140}
            height={45}
            priority
          />
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-dourado/10 text-dourado'
                      : 'text-cafe/70 hover:bg-seda/50 hover:text-cafe'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive ? 'text-dourado' : 'text-cafe/50')} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Kiosk Mode Button - Only for admin */}
        {userInfo?.role === 'admin' && (
          <div className="border-t border-nude/30 p-4">
            <Link href="/formulario">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-vinho/30 text-vinho hover:bg-vinho hover:text-white"
              >
                <Monitor className="h-4 w-4" />
                Modo Kiosk
              </Button>
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-nude/30 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {/* Mobile Sidebar Content */}
              <div className="flex h-16 items-center border-b border-nude/30 px-6">
                <Image
                  src="/images/logo.png"
                  alt="Felice"
                  width={140}
                  height={45}
                />
              </div>
              <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-3">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-dourado/10 text-dourado'
                            : 'text-cafe/70 hover:bg-seda/50 hover:text-cafe'
                        )}
                      >
                        <item.icon className={cn('h-5 w-5', isActive ? 'text-dourado' : 'text-cafe/50')} />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </ScrollArea>
              {userInfo?.role === 'admin' && (
                <div className="border-t border-nude/30 p-4">
                  <Link href="/formulario" onClick={() => setSidebarOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-vinho/30 text-vinho hover:bg-vinho hover:text-white"
                    >
                      <Monitor className="h-4 w-4" />
                      Modo Kiosk
                    </Button>
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Page Title Area */}
          <div className="flex-1">
            {/* Pode ser usado para breadcrumbs ou título da página */}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-seda/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={userInfo?.nome || 'Usuário'} />
                  <AvatarFallback className="bg-dourado/20 text-dourado text-sm">
                    {userInfo ? getInitials(userInfo.nome) : '...'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-cafe md:inline-block">
                  {userInfo?.nome || 'Carregando...'}
                </span>
                <ChevronDown className="h-4 w-4 text-cafe/50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-cafe">{getRoleLabel(userInfo?.role || 'atendente')}</p>
                  <p className="text-xs text-cafe/60">{userInfo?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userInfo?.role === 'admin' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/configuracoes" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                className="text-error focus:text-error cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
