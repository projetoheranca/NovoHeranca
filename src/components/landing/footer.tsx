
import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="bg-card border-t py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="secao-legal">
                    <h4 className="font-semibold mb-3">Legal</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/termos-de-uso" className="hover:underline underline-offset-4">Termos de Uso</Link></li>
                        <li><Link href="/politica-de-privacidade" className="hover:underline underline-offset-4">Política de Privacidade</Link></li>
                        <li><Link href="/politica-de-cookies" className="hover:underline underline-offset-4">Política de Cookies</Link></li>
                        <li><Link href="/politica-de-reembolso" className="hover:underline underline-offset-4">Política de Reembolso</Link></li>
                    </ul>
                </div>
                
                <div className="secao-contato">
                    <h4 className="font-semibold mb-3">Contato</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Email: help@minhaherancadigital.com</li>
                        <li>WhatsApp: +55 11 97527-1829</li>
                        <li>DPO (LGPD): dpo@minhaherancadigital.com</li>
                    </ul>
                </div>
                
                <div className="secao-empresa">
                    <h4 className="font-semibold mb-3">Minha Herança Digital</h4>
                    <p className="text-sm text-muted-foreground">CNPJ: 51.144.507/0001-50</p>
                </div>
            </div>
            
            <div className="footer-bottom mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
                <p>© 2025 Minha Herança Digital. Todos os direitos reservados.</p>
                <p className="mt-2">
                    <a href="https://www.mopia.com.br/agencia/" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
                        Desenvolvido pela Agencia 1Day
                    </a>
                </p>
            </div>
        </div>
    </footer>
  )
}
