"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Stethoscope,
  Building2,
  Users,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { href: "/admin/exames", label: "Preços & Exames", icon: Stethoscope },
  { href: "/admin/empresas", label: "Empresas (CNPJ)", icon: Building2 },
  { href: "/admin/trabalhadores", label: "Trabalhadores (CPF)", icon: Users },
  { href: "/admin/unidades", label: "Unidades & Horários", icon: MapPin },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 shrink-0 flex flex-col justify-between shadow-xs">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-[#0F2C59] border border-sky-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F2C59]">
                Painel de Gestão
              </h2>
              <p className="text-[10px] text-slate-500 font-normal">B&C Saúde Ocupacional</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#0F2C59] text-white font-bold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Link to Public Page */}
        <div className="hidden md:block pt-4 border-t border-slate-200">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition"
          >
            <span>Ver Formulário Público</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#0F2C59]" />
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
