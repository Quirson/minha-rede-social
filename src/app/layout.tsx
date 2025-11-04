import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext"; // ← ADICIONAR ESTA LINHA
import { GroupProvider } from "@/context/GroupContext"; // <-- ADICIONE ESTA LINHA

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Minha Rede Social",
    description: "Uma rede social incrível criada com Next.js e Strapi",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br">
        <body className={inter.className}>
        <AuthProvider>
            <ChatProvider>
                <GroupProvider>
                    {children}
                </GroupProvider>
            </ChatProvider>

        </AuthProvider>
        </body>
        </html>
    );
}