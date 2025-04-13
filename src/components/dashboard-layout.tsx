"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BarChart, 
  Users, 
  Settings, 
  LogOut,
  BookText,
  Lightbulb,
  Smartphone,
  ShieldAlert,
  MessageCircle,
  CalendarDays,
  Flag,
  BookOpen,
  Home,
  Database
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function SidebarItem({ href, icon, label, active }: SidebarItemProps) {
  return (
    <Link href={href} passHref>
      <div 
        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
          active ? "bg-gray-100 font-medium" : ""
        }`}
      >
        <div className="text-gray-500">{icon}</div>
        <span>{label}</span>
      </div>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const items = [
    {
      href: "/dashboard",
      icon: <Home size={20} />,
      label: "Accueil",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/users",
      icon: <Users size={20} />,
      label: "Utilisateurs",
      active: pathname === "/dashboard/users",
    },
    {
      href: "/dashboard/comments",
      icon: <MessageCircle size={20} />,
      label: "Commentaires",
      active: pathname === "/dashboard/comments",
    },
    {
      href: "/dashboard/words",
      icon: <BookOpen size={20} />,
      label: "Mots",
      active: pathname === "/dashboard/words",
    },
    {
      href: "/dashboard/suggestions",
      icon: <Lightbulb size={20} />,
      label: "Suggestions",
      active: pathname === "/dashboard/suggestions",
    },
    {
      href: "/dashboard/mot-du-jour",
      icon: <CalendarDays size={20} />,
      label: "Mot du jour",
      active: pathname === "/dashboard/mot-du-jour",
    },
    {
      href: "/dashboard/moderation",
      icon: <Flag size={20} />,
      label: "Modération",
      active: pathname === "/dashboard/moderation",
    },
    {
      href: "/dashboard/settings",
      icon: <Settings size={20} />,
      label: "Paramètres",
      active: pathname === "/dashboard/settings",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white p-4">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="space-y-1">
          {items.map((item) => (
            <SidebarItem 
              key={item.href}
              href={item.href} 
              icon={item.icon} 
              label={item.label} 
              active={item.active} 
            />
          ))}
        </nav>
        <div className="absolute bottom-4 w-56">
          <Button 
            variant="outline" 
            className="w-full justify-start space-x-2" 
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
} 