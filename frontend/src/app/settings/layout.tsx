"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Shield, FileText, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const sidebarItems = [
	{ icon: User, label: "Profile", href: "/settings/profile" },
	{ icon: Shield, label: "Account & Privacy", href: "/settings/account" },
	{ icon: FileText, label: "My Content", href: "/settings/content" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	return (
		<div className="max-w-7xl mx-auto py-4 md:py-12 px-3 md:px-4 flex flex-col md:flex-row gap-4 md:gap-8">
			{/* Sidebar */}
			<aside className="w-full md:w-64 space-y-2 md:space-y-2 sticky top-14 md:top-auto z-20 md:z-auto bg-[#FDFCF9] md:bg-transparent pb-2 md:pb-0">
				<h2 className="text-xl md:text-2xl font-light text-sacred-text mb-3 md:mb-8 px-2 md:px-4 font-serif italic">Control Center</h2>
				<nav className="flex md:block gap-2 overflow-x-auto no-scrollbar px-1 md:px-0 pb-1">
					{sidebarItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"shrink-0 flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl transition-all duration-200 group relative",
									isActive
										? "bg-sacred-gold text-white shadow-lg shadow-sacred-gold/20"
										: "text-sacred-muted hover:bg-sacred-gold/5 hover:text-sacred-gold"
								)}
							>
								{isActive && (
									<motion.div
										layoutId="activeSide"
										className="absolute inset-0 bg-sacred-gold rounded-2xl -z-1"
										transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
									/>
								)}
								<item.icon
									size={20}
									className={cn(
										"relative z-10",
										isActive ? "text-white" : "group-hover:scale-110 transition-transform"
									)}
								/>
								<span className="font-medium relative z-10 text-sm md:text-base whitespace-nowrap">{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</aside>

			{/* Main Content */}
			<main className="flex-1 min-w-0">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="bg-white rounded-3xl md:rounded-4xl p-4 md:p-12 shadow-[0_20px_50px_rgba(217,160,91,0.05)] border border-sacred-gold/5 min-h-120 md:min-h-150"
				>
					{children}
				</motion.div>
			</main>
		</div>
	);
}
