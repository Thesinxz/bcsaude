"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Search,
  ShieldCheck,
  Building2,
  Phone,
  Menu,
  X,
  MapPin,
  ArrowRight,
  FileText,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full max-w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3.5 py-2.5 sm:px-6">
          {/* Logo B&C Saúde */}
          <Link
            href="/institucional"
            onClick={closeMenu}
            className="group flex items-center gap-2 sm:gap-3 transition shrink-0 min-w-0"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[#0F2C59] font-mono font-bold text-white shadow-xs shrink-0">
              <span className="text-xs sm:text-sm tracking-tight font-black">B&C</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-[#0F2C59] text-sm sm:text-lg truncate">
                  B&C Saúde
                </span>
                <span className="hidden xs:inline-block rounded bg-sky-50 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-sky-800 border border-sky-200 shrink-0">
                  Ocupacional
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-normal truncate hidden sm:block">
                Medicina & Segurança do Trabalho · CRM/MS 955
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link
              href="/institucional"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs lg:text-sm font-medium transition ${
                pathname === "/institucional"
                  ? "bg-slate-100 text-[#0F2C59] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Building2 className="h-4 w-4 text-sky-700" />
              <span>A Empresa</span>
            </Link>

            <Link
              href="/"
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs lg:text-sm font-bold transition shadow-xs ${
                pathname === "/"
                  ? "bg-[#0F2C59] text-white"
                  : "bg-sky-50 text-[#0F2C59] border border-sky-200 hover:bg-sky-100"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Agendamento Online</span>
            </Link>

            <Link
              href="/consultar"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs lg:text-sm font-medium transition ${
                pathname.startsWith("/consultar") || pathname.startsWith("/comprovante")
                  ? "bg-sky-50 text-sky-900 border border-sky-200 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Search className="h-4 w-4 text-sky-700" />
              <span>Consultar Protocolo</span>
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs lg:text-sm font-medium transition ${
                isAdmin
                  ? "bg-slate-900 text-white font-bold"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              <span>Admin</span>
            </Link>
          </nav>

          {/* Mobile Right Controls: Quick Action + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/"
              onClick={closeMenu}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                pathname === "/"
                  ? "bg-[#0F2C59] text-white"
                  : "bg-sky-50 text-[#0F2C59] border border-sky-200"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Agendar</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 focus:outline-none transition"
              aria-label="Menu de Navegação"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={closeMenu}
          />

          {/* Slide-in Drawer */}
          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-white shadow-2xl flex flex-col justify-between p-5 z-10 overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F2C59] font-mono font-bold text-white text-xs">
                    B&C
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F2C59]">B&C Saúde</h3>
                    <p className="text-[10px] text-slate-500">Menu Principal</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links List */}
              <div className="space-y-1.5 text-xs font-semibold">
                <Link
                  href="/institucional"
                  onClick={closeMenu}
                  className={`flex items-center justify-between rounded-xl p-3 transition ${
                    pathname === "/institucional"
                      ? "bg-slate-100 text-[#0F2C59] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-sky-700" />
                    <span>A Empresa (Institucional)</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/"
                  onClick={closeMenu}
                  className={`flex items-center justify-between rounded-xl p-3 transition ${
                    pathname === "/"
                      ? "bg-[#0F2C59] text-white font-bold shadow-xs"
                      : "bg-sky-50/70 text-[#0F2C59] border border-sky-200/80 font-bold"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" />
                    <span>Agendamento Online</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-80" />
                </Link>

                <Link
                  href="/consultar"
                  onClick={closeMenu}
                  className={`flex items-center justify-between rounded-xl p-3 transition ${
                    pathname.startsWith("/consultar") || pathname.startsWith("/comprovante")
                      ? "bg-sky-50 text-sky-900 border border-sky-200 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-sky-700" />
                    <span>Consultar Protocolo / ASO</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/institucional#orcamento"
                  onClick={closeMenu}
                  className="flex items-center justify-between rounded-xl p-3 text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-emerald-700" />
                    <span>Solicitar Orçamento PJ</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className={`flex items-center justify-between rounded-xl p-3 transition ${
                    isAdmin
                      ? "bg-slate-900 text-white font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-slate-500" />
                    <span>Painel Administrativo</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </div>

              {/* Unidades Info */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-[11px] text-slate-600">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#0F2C59]" /> Unidades no MS:
                </span>
                <p>• Jardim/MS: R. Sete de Setembro, 772</p>
                <p>• Bela Vista/MS: R. Visconde de Taunay, 555</p>
                <p>• Bonito/MS: R. Pércio Schamann, 374</p>
                <p>• Campo Grande/MS: Av. Afonso Pena, 3200</p>
              </div>
            </div>

            {/* Bottom Contact */}
            <div className="pt-4 border-t border-slate-100">
              <a
                href="https://api.whatsapp.com/send?phone=5567981131076&text=Olá,%20gostaria%20de%20informações%20sobre%20atendimento%20ocupacional"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 p-3 text-xs font-bold text-white shadow-xs transition"
              >
                <Phone className="h-4 w-4" />
                <span>WhatsApp: (67) 9 8113-1076</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
