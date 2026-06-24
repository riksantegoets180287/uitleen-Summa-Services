import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { UserLending } from "./components/UserLending";
import { Terugbrengen } from "./components/Terugbrengen";
import { AdminDashboard } from "./components/AdminDashboard";
import { INITIAL_CATEGORIES, INITIAL_MATERIALS } from "./initialData";
import { Category, Material, Loan, Role } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { KeyRound, ShieldAlert, Lock, X } from "lucide-react";

export default function App() {
  // --- Persistent State Hooks ---
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem("summa_role") as Role) || null;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const data = localStorage.getItem("summa_categories");
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const data = localStorage.getItem("summa_materials");
    return data ? JSON.parse(data) : INITIAL_MATERIALS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const data = localStorage.getItem("summa_loans");
    if (data) return JSON.parse(data);
    
    // Seed default returned transactions to populate history beautifully on first load
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const dateStr = twoDaysAgo.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = "11:15";

    return [
      {
        id: "loan-seed-1",
        materialId: "mat-2",
        materialName: "HDMI kabel",
        categoryName: "ICT",
        borrowerName: "Mark",
        borrowerTeam: "Media & Design M2",
        quantity: 1,
        borrowedAtDate: dateStr,
        borrowedAtTime: timeStr,
        status: "teruggebracht",
        returnedAt: `${dateStr} om 14:30`,
      },
      {
        id: "loan-seed-2",
        materialId: "mat-1",
        materialName: "Laptop oplader",
        categoryName: "ICT",
        borrowerName: "Romy",
        borrowerTeam: "ICT Academie",
        quantity: 1,
        borrowedAtDate: dateStr,
        borrowedAtTime: "09:30",
        status: "uitgeleend",
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<"catalogus" | "terugbrengen" | "beheer">(() => {
    return (localStorage.getItem("summa_active_tab") as any) || "catalogus";
  });

  // Login Modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPin, setLoginPin] = useState("");
  const [loginRole, setLoginRole] = useState<"uitlener" | "admin" >("uitlener");
  const [loginError, setLoginError] = useState("");

  // --- Synchronization Effects ---
  useEffect(() => {
    if (role) localStorage.setItem("summa_role", role);
    else localStorage.removeItem("summa_role");
  }, [role]);

  useEffect(() => {
    localStorage.setItem("summa_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("summa_materials", JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem("summa_loans", JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem("summa_active_tab", activeTab);
  }, [activeTab]);

  // Ensure users with certain roles are on allowed tabs
  useEffect(() => {
    if (!role && activeTab !== "catalogus") {
      setActiveTab("catalogus");
    } else if (role === "uitlener" && activeTab === "beheer") {
      setActiveTab("terugbrengen");
    }
  }, [role, activeTab]);

  // --- Handlers ---
  const handleLoginClick = () => {
    setLoginPin("");
    setLoginError("");
    setIsLoginModalOpen(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPin === "1234") {
      setRole(loginRole);
      setLoginError("");
      setLoginPin("");
      setIsLoginModalOpen(false);
      // Automatically switch tab to relevant view
      if (loginRole === "admin") {
        setActiveTab("beheer");
      } else {
        setActiveTab("terugbrengen");
      }
    } else {
      setLoginError("Onjuiste pincode. Probeer het opnieuw.");
      setLoginPin("");
    }
  };

  const handleLogout = () => {
    setRole(null);
    setActiveTab("catalogus");
  };

  const handleResetAll = () => {
    if (
      confirm(
        "Weet u zeker dat u alle materialen, categorieën en leningen wilt herstellen naar de beginwaarden?"
      )
    ) {
      localStorage.removeItem("summa_role");
      localStorage.removeItem("summa_categories");
      localStorage.removeItem("summa_materials");
      localStorage.removeItem("summa_loans");
      localStorage.removeItem("summa_active_tab");

      setCategories(INITIAL_CATEGORIES);
      setMaterials(INITIAL_MATERIALS);
      setLoans([]);
      setRole(null);
      setActiveTab("catalogus");
    }
  };

  // --- CRUD and Process Handlers ---

  const handleAddMaterial = (newMat: Omit<Material, "id" | "createdAt">) => {
    const material: Material = {
      ...newMat,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMaterials((prev) => [material, ...prev]);
  };

  const handleEditMaterial = (
    id: string,
    updatedFields: Omit<Material, "id" | "createdAt">
  ) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m))
    );
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddCategory = (name: string) => {
    const category: Category = {
      id: `cat-${Date.now()}`,
      name,
    };
    setCategories((prev) => [...prev, category]);
  };

  const handleEditCategory = (id: string, name: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleReturnLoan = (loanId: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: "teruggebracht",
              returnedAt: `${dateStr} om ${timeStr}`,
            }
          : l
      )
    );
  };

  const handleRegisterLoan = (
    materialId: string,
    borrowerName: string,
    borrowerTeam: string,
    quantity: number
  ) => {
    const material = materials.find((m) => m.id === materialId);
    if (!material) return;
    const category = categories.find((c) => c.id === material.categoryId);

    const now = new Date();
    const dateStr = now.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      materialId,
      materialName: material.name,
      categoryName: category ? category.name : "Overig",
      borrowerName,
      borrowerTeam,
      quantity,
      borrowedAtDate: dateStr,
      borrowedAtTime: timeStr,
      status: "uitgeleend",
    };

    setLoans((prev) => [newLoan, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5FA] font-sans antialiased text-gray-900 selection:bg-summa-rose/10 selection:text-summa-rose">
      
      {/* Navbar Component */}
      <Navbar
        currentRole={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoginClick={handleLoginClick}
        onLogout={handleLogout}
        onResetAll={handleResetAll}
      />

      {/* Main Content routing */}
      <main className="flex-1 pb-16">
        {activeTab === "catalogus" && (
          <UserLending
            categories={categories}
            materials={materials}
            loans={loans}
            currentRole={role}
            onRegisterLoan={handleRegisterLoan}
            onLoginSuccess={(loggedInRole) => {
              setRole(loggedInRole);
            }}
          />
        )}

        {activeTab === "terugbrengen" && role && (
          <Terugbrengen
            loans={loans}
            onReturnLoan={handleReturnLoan}
          />
        )}

        {activeTab === "beheer" && role === "admin" && (
          <AdminDashboard
            categories={categories}
            materials={materials}
            loans={loans}
            onAddMaterial={handleAddMaterial}
            onEditMaterial={handleEditMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onReturnLoan={handleReturnLoan}
          />
        )}
      </main>

      {/* Primary Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 bg-summa-indigo/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-150/60"
            >
              {/* Modal Banner */}
              <div className="bg-summa-indigo px-6 py-8 text-center text-white relative">
                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="absolute right-4 top-4 p-2 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Sluiten"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex p-3 bg-white/10 rounded-xl mb-3">
                  <Lock className="w-6 h-6 text-summa-rose" />
                </div>
                <h2 className="text-2xl font-display font-bold">Medewerker Toegang</h2>
                <p className="text-xs text-indigo-200 mt-1">
                  Kies uw gewenste rol en voer de pincode in.
                </p>
              </div>

              {/* Modal Login Form */}
              <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-6">
                {loginError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium text-center">
                    {loginError}
                  </div>
                )}

                {/* Role Switch */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    Selecteer Rol
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl text-xs font-bold text-gray-700">
                    <button
                      type="button"
                      onClick={() => setLoginRole("uitlener")}
                      className={`py-2.5 rounded-lg cursor-pointer transition-colors ${
                        loginRole === "uitlener"
                          ? "bg-summa-indigo text-white shadow"
                          : "hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      Uitlener (Medewerker)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginRole("admin")}
                      className={`py-2.5 rounded-lg cursor-pointer transition-colors ${
                        loginRole === "admin"
                          ? "bg-summa-indigo text-white shadow"
                          : "hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      Admin (Beheerder)
                    </button>
                  </div>
                </div>

                {/* PIN Input */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider text-center" htmlFor="login-pin">
                    Pincode
                  </label>
                  <input
                    type="password"
                    id="login-pin"
                    maxLength={4}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="block w-36 mx-auto text-center py-2.5 text-2xl font-mono tracking-widest border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo text-gray-900 bg-gray-50/50"
                    autoFocus
                    required
                  />
                  <p className="text-center text-xs text-gray-400">
                    Pincode is <strong className="text-summa-indigo font-mono">1234</strong> voor demo doeleinden.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 bg-summa-indigo hover:bg-indigo-950 text-white font-display font-bold py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Inloggen</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
