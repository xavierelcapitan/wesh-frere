"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  Database,
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
}

function SidebarItem({ href, icon, label, active, collapsed }: SidebarItemProps) {
  return (
    <Link href={href} passHref>
      <div 
        className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"} p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
          active ? "bg-gray-100 font-medium" : ""
        }`}
      >
        <div className="text-gray-500">{icon}</div>
        {!collapsed && <span>{label}</span>}
      </div>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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
      <div 
        className={`${
          collapsed ? "w-16" : "w-64"
        } transition-all duration-300 ease-in-out border-r bg-white p-4 relative`}
      >
        <div className={`${collapsed ? "justify-center" : "px-2"} mb-8 flex items-center`}>
          {!collapsed && <h1 className="text-xl font-bold">Admin</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            className={`ml-auto ${collapsed ? "mx-auto" : ""}`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        <nav className="space-y-1">
          {items.map((item) => (
            <SidebarItem 
              key={item.href}
              href={item.href} 
              icon={item.icon} 
              label={item.label} 
              active={item.active} 
              collapsed={collapsed}
            />
          ))}
        </nav>
        
        <div className={`absolute bottom-4 ${collapsed ? "w-12" : "w-56"}`}>
          <Button 
            variant="outline" 
            className={`w-full ${collapsed ? "justify-center p-2" : "justify-start space-x-2"}`} 
            onClick={handleLogout}
          >
            <LogOut size={18} />
            {!collapsed && <span>Déconnexion</span>}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isMobile && (
          <div className="p-4 border-b bg-white">
            <Button variant="outline" size="icon" onClick={() => setCollapsed(!collapsed)}>
              <Menu size={20} />
            </Button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
} 