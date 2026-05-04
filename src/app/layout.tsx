import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { SessionProvider } from "@/context/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatAssistant } from "@/components/chatbot/chat-assistant";
import Script from "next/script"; // Importação necessária para o Google Analytics

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://minhaherancadigital.com';

export const metadata: Metadata = {
  title: "Minha Herança Digital",
  description: "Seu cofre de herança digital seguro para proteger senhas, documentos e memórias, garantindo a entrega automática para seus herdeiros.",
  openGraph: {
    title: "Minha Herança Digital | Proteja Seu Legado",
    description: "Garanta que suas informações mais importantes, senhas e memórias cheguem às pessoas certas. Conheça o cofre digital com entrega automática.",
    url: siteUrl,
    siteName: 'Minha Herança Digital',
    images: [
      {
        url: `${siteUrl}/img/imgfun.jpg`,
        width: 1200,
        height: 630,
        alt: 'Mãos de diferentes gerações se tocando, simbolizando legado.',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N3C7VBML');
          `}
        </Script>
        {/* End Google Tag Manager */}
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Inter:wght@400;500;600;700;800;900&family=Roboto:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Playfair+Display:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          fontInter.variable,
        )}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-N3C7VBML"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <SessionProvider>
            {children}
            <ChatAssistant />
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
