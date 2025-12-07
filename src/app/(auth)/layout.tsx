import Image from 'next/image'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-felice flex-col justify-between p-12">
        <div>
          <Image
            src="/images/logo.png"
            alt="Felice"
            width={180}
            height={60}
            className="brightness-0 invert"
          />
        </div>

        <div className="space-y-6">
          <h1 className="font-butler text-4xl text-white leading-tight">
            Relacionamento<br />
            Felice
          </h1>
          <p className="font-sarabun text-lg text-white/80 max-w-md">
            Ajude aos nossos pacientes a conhecerem tudo o que podemos oferecer.
          </p>
        </div>

        <p className="font-sarabun text-sm text-white/60">
          © {new Date().getFullYear()} Complexo Felice. Todos os direitos reservados.
        </p>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col bg-gradient-soft">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 flex justify-center bg-white border-b border-nude/30">
          <Image
            src="/images/logo.png"
            alt="Felice"
            width={140}
            height={45}
          />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden p-6 text-center">
          <p className="font-sarabun text-sm text-cafe/60">
            © {new Date().getFullYear()} Complexo Felice
          </p>
        </div>
      </div>
    </div>
  )
}
