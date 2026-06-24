import React from "react";
import { LogOut, ShieldCheck, KeyRound, RefreshCw, Layers, ClipboardCheck, Settings } from "lucide-react";
import { Role } from "../types";

interface NavbarProps {
  currentRole: Role;
  activeTab: string;
  setActiveTab: (tab: "catalogus" | "terugbrengen" | "beheer") => void;
  onLoginClick: () => void;
  onLogout: () => void;
  onResetAll?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeTab,
  setActiveTab,
  onLoginClick,
  onLogout,
  onResetAll,
}) => {
  return (
    <header className="bg-summa-indigo text-white shadow-md border-b-4 border-summa-rose sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:h-20 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("catalogus")}>
            <div className="bg-white text-summa-indigo rounded-full p-2 font-display font-bold text-lg sm:text-xl tracking-wider shadow-inner w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              S+
            </div>
            <div>
              <span className="font-display font-bold text-lg sm:text-2xl tracking-tight block leading-tight">
                Summa Plus
              </span>
              <span className="text-xs text-purple-200 tracking-widest uppercase font-mono block -mt-1 font-semibold">
                Uitleensysteem
              </span>
            </div>
          </div>

          {/* Navigation Tabs for Logged-in Users */}
          {currentRole && (
            <nav className="flex items-center space-x-1 bg-indigo-950/40 p-1 rounded-xl border border-indigo-800/40">
              <button
                onClick={() => setActiveTab("catalogus")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "catalogus"
                    ? "bg-summa-rose text-white shadow-sm"
                    : "text-indigo-200 hover:text-white hover:bg-indigo-900/40"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Catalogus</span>
              </button>

              <button
                onClick={() => setActiveTab("terugbrengen")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "terugbrengen"
                    ? "bg-summa-rose text-white shadow-sm"
                    : "text-indigo-200 hover:text-white hover:bg-indigo-900/40"
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Terugbrengen</span>
              </button>

              {currentRole === "admin" && (
                <button
                  onClick={() => setActiveTab("beheer")}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "beheer"
                      ? "bg-summa-rose text-white shadow-sm"
                      : "text-indigo-200 hover:text-white hover:bg-indigo-900/40"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Beheer</span>
                </button>
              )}
            </nav>
          )}

          {/* Current Status and Login/Logout Action */}
          <div className="flex items-center space-x-2 justify-end">
            {/* Reset button to clear data to default */}
            {onResetAll && currentRole === "admin" && (
              <button
                onClick={onResetAll}
                title="Herstel alle gegevens"
                className="p-2 rounded-xl hover:bg-indigo-800 text-indigo-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {!currentRole ? (
              <button
                onClick={onLoginClick}
                className="flex items-center space-x-2 bg-summa-rose hover:bg-summa-rose/90 hover:scale-[1.02] active:scale-[0.98] text-white px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-white" />
                <span>Inloggen Medewerker</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 bg-indigo-950/40 border border-indigo-700/50 rounded-xl py-1.5 px-3.5 text-xs font-semibold text-indigo-100">
                  <ShieldCheck className="w-4 h-4 text-summa-rose" />
                  <span>
                    {currentRole === "admin" ? "Beheerder" : "Uitlener"}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 bg-indigo-900/50 hover:bg-indigo-800 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-indigo-700/40 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Loguit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Badge for Logged-In User */}
      {currentRole && (
        <div className="md:hidden flex items-center justify-between px-4 py-1.5 bg-indigo-950 border-t border-indigo-900 text-xs text-indigo-200">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-summa-rose" />
            <span>Rol: <strong className="text-white capitalize">{currentRole === "admin" ? "Beheerder" : "Uitlener"}</strong></span>
          </div>
        </div>
      )}
    </header>
  );
};
