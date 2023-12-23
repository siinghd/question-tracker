import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import ThemeSwitch from "../components/ThemeSwitch";
import CLogoutButton from "../components/CLogout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={inter.className}>
				<Providers>
					<Toaster position='top-right' richColors />
					<CLogoutButton />

					<ThemeSwitch />

					{children}
				</Providers>
			</body>
		</html>
	);
}
