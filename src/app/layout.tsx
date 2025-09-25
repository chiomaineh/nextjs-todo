// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import Providers from "./lib/providers";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Todo App",
//   description: "A simple todo application built with Next.js",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <Providers>
//           <div className="min-h-screen bg-blue-100 flex items-center justify-center">
//             {children}
//           </div>
//         </Providers>
//       </body>
//     </html>
//   );
// }

// FIREBASE AUTHENTICATION
import "./globals.css"
import type { Metadata } from "next";

import Providers from "./lib/providers";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple todo application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* The className for the body has been simplified to remove the font variables */}
      <body className="antialiased">
        <AuthProvider>
          <Providers>{children}</Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
