import Link from "next/link";
import { Shield, Lock, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#0F2C59] text-slate-200 text-xs py-10 px-4 sm:px-6 no-print">
      <div className="mx-auto max-w-6xl flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8 border-b border-slate-700/80">
          <div>
            <h4 className="text-white font-bold text-sm mb-3">B&C Saúde Ocupacional</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Bento & Carvalho LTDA · CRM/MS 955<br />
              Responsável Técnico: Dr. Marcos Cortes de Carvalho (CRM 5773 / RQE 4675).<br />
              15 anos de atuação em Medicina e Segurança do Trabalho no Mato Grosso do Sul.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Unidades de Atendimento</h4>
            <ul className="space-y-2 text-slate-300 text-xs">
              <li><strong>Jardim/MS:</strong> R. Sete de Setembro, 772 - Centro</li>
              <li><strong>Bela Vista/MS:</strong> R. Visconde de Taunay, 555 - Centro</li>
              <li><strong>Bonito/MS:</strong> R. Pércio Schamann, 374 - Vila Donária</li>
              <li><strong>Campo Grande/MS:</strong> Av. Afonso Pena, 3200 - Centro</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Conformidade & LGPD</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Emissão de ASO conforme NR-7/MTE e envio dos eventos S-2210, S-2220 e S-2240 ao eSocial. Dados e prontuários protegidos pela LGPD e Resoluções do CFM.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Central de Contato</h4>
            <p className="text-slate-300 text-xs leading-relaxed mb-2">
              WhatsApp & Suporte Corporativo:<br />
              <strong className="text-sky-300 text-sm">(67) 9 8113-1076</strong>
            </p>
            <p className="text-slate-300 text-xs">
              Horário de Atendimento:<br />
              Segunda a Sexta: 07:30 às 17:00
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} B&C Saúde (Bento & Carvalho LTDA) · Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-slate-300">
            <Link href="/institucional" className="hover:text-white transition">Institucional</Link>
            <Link href="/" className="hover:text-white transition">Agendamento Online</Link>
            <Link href="/consultar" className="hover:text-white transition">Consultar Protocolo</Link>
            <Link href="/admin" className="hover:text-white transition">Área Restrita</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
