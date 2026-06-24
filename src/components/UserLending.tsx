import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Hash, Check, PackageOpen, Layers, KeyRound, ShieldAlert, Clock, User, Award, ClipboardList } from "lucide-react";
import { Category, Material, Loan, Role } from "../types";

interface UserLendingProps {
  categories: Category[];
  materials: Material[];
  loans: Loan[];
  currentRole: Role;
  onRegisterLoan: (
    materialId: string,
    borrowerName: string,
    borrowerTeam: string,
    quantity: number
  ) => void;
  onLoginSuccess: (role: "admin" | "uitlener") => void;
}

export const UserLending: React.FC<UserLendingProps> = ({
  categories,
  materials,
  loans,
  currentRole,
  onRegisterLoan,
  onLoginSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  
  // Inline login / registration state
  const [pinInput, setPinInput] = useState("");
  const [selectedRoleForPin, setSelectedRoleForPin] = useState<"uitlener" | "admin">("uitlener");
  const [pinError, setPinError] = useState("");

  // Customer information state
  const [customerName, setCustomerName] = useState("");
  const [customerTeam, setCustomerTeam] = useState(""); // mapping to Opleiding
  const [borrowQuantity, setBorrowQuantity] = useState<number>(1);
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successDetails, setSuccessDetails] = useState<{
    materialName: string;
    quantity: number;
    borrowerName: string;
    borrowerTeam: string;
    date: string;
    time: string;
  } | null>(null);

  // Auto-updating live time string for the form
  useEffect(() => {
    const updateTime = () => {
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
      setCurrentTimeStr(`${dateStr} om ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate available quantity for a material
  const getAvailableQuantity = (material: Material) => {
    const activeLoansCount = loans
      .filter((l) => l.materialId === material.id && l.status === "uitgeleend")
      .reduce((sum, l) => sum + l.quantity, 0);
    return Math.max(0, material.totalQuantity - activeLoansCount);
  };

  // Filter and search materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesCategory =
        selectedCategoryId === "all" || m.categoryId === selectedCategoryId;

      const cleanQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(cleanQuery) ||
        (m.optionalBarcode && m.optionalBarcode.toLowerCase().includes(cleanQuery)) ||
        (m.notes && m.notes.toLowerCase().includes(cleanQuery));

      return matchesCategory && matchesSearch;
    });
  }, [materials, loans, selectedCategoryId, searchQuery]);

  // Handle click on item
  const handleSelectMaterial = (material: Material) => {
    const available = getAvailableQuantity(material);
    if (available <= 0) return; // None left
    setSelectedMaterial(material);
    setBorrowQuantity(1);
    setPinInput("");
    setPinError("");
    setCustomerName("");
    setCustomerTeam("");
  };

  // Inline PIN Authentication Handler
  const handleInlinePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "1234") {
      onLoginSuccess(selectedRoleForPin);
      setPinError("");
      setPinInput("");
    } else {
      setPinError("Onjuiste pincode. Probeer 1234.");
      setPinInput("");
    }
  };

  // Confirm loan submission
  const handleConfirmLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    if (!customerName.trim()) {
      alert("Vul de voornaam van de klant in.");
      return;
    }
    if (!customerTeam.trim()) {
      alert("Vul de opleiding van de klant in.");
      return;
    }

    const available = getAvailableQuantity(selectedMaterial);
    if (borrowQuantity < 1) {
      alert("Kies minimaal 1 exemplaar.");
      return;
    }
    if (borrowQuantity > available) {
      alert(`Er zijn slechts ${available} exemplaren beschikbaar.`);
      return;
    }

    // Call registration prop
    onRegisterLoan(selectedMaterial.id, customerName.trim(), customerTeam.trim(), borrowQuantity);

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

    setSuccessDetails({
      materialName: selectedMaterial.name,
      quantity: borrowQuantity,
      borrowerName: customerName.trim(),
      borrowerTeam: customerTeam.trim(),
      date: dateStr,
      time: timeStr,
    });

    setSuccessMessage(
      `Uitleen succesvol geregistreerd voor ${customerName.trim()} (${customerTeam.trim()}).`
    );

    // Reset details but keep success shown
    setSelectedMaterial(null);
  };

  const handleDismissSuccess = () => {
    setSuccessMessage(null);
    setSuccessDetails(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      {/* Welcome & Info Banner */}
      <div className="bg-white rounded-2xl p-6 card-shadow border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-summa-indigo">
            {currentRole ? `Welkom Medewerker (${currentRole === "admin" ? "Beheerder" : "Uitlener"})` : "Welkom bij Summa Plus"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {currentRole 
              ? "U bent ingelogd en kunt nu direct producten scannen of selecteren om een uitleen te registreren."
              : "Als gast kunt u vrijblijvend rondkijken en zoeken. Voor het daadwerkelijk lenen is autorisatie van een medewerker vereist."}
          </p>
        </div>
        
        {!currentRole && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 flex items-center space-x-2.5 max-w-sm">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              <strong>Gasten:</strong> Selecteer een artikel. De medewerker voert ter plekke de pincode in om de uitleen te starten.
            </span>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successMessage && successDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8 bg-emerald-50 border-2 border-emerald-500/25 rounded-2xl p-6 card-shadow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-24 h-24 bg-emerald-100 rounded-full blur-xl opacity-50" />
            
            <div className="flex items-start space-x-4">
              <div className="bg-emerald-500 text-white rounded-xl p-3 shadow-md shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-1 w-full">
                <h3 className="font-display font-bold text-emerald-900 text-lg">
                  Uitleen Geregistreerd!
                </h3>
                <p className="text-sm text-emerald-800 font-medium">
                  {successMessage}
                </p>
                
                <div className="mt-4 pt-3 border-t border-emerald-500/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-emerald-700">
                  <div>
                    <span className="font-semibold text-emerald-900 block">Klant:</span> 
                    {successDetails.borrowerName}
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-900 block">Opleiding:</span> 
                    {successDetails.borrowerTeam}
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-900 block">Materiaal:</span> 
                    {successDetails.materialName} ({successDetails.quantity}x)
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-900 block">Datum & Tijd:</span> 
                    {successDetails.date} om {successDetails.time}
                  </div>
                </div>

                <div className="mt-4 pt-1">
                  <button
                    onClick={handleDismissSuccess}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    Nieuwe registratie of doorgaan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 card-shadow border border-gray-100 mb-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Zoek op materiaalnaam, notes of barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo focus:border-summa-indigo text-sm text-gray-900 placeholder-gray-400 bg-gray-50/30 transition-all"
            />
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-400 font-mono bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-100">
            <Hash className="w-4 h-4 text-gray-400" />
            <span>Zoeken op barcode kan direct via de zoekbalk</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Filteren op Categorie
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedCategoryId === "all"
                  ? "bg-summa-indigo text-white shadow-md shadow-indigo-900/10"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Alle Categorieën</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? "bg-summa-indigo text-white shadow-md shadow-indigo-900/10"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-display font-bold text-lg text-gray-900">
            Beschikbare Materialen ({filteredMaterials.length})
          </h3>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-summa-rose hover:underline cursor-pointer"
            >
              Wis zoekopdracht
            </button>
          )}
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 card-shadow max-w-lg mx-auto">
            <PackageOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="font-display font-bold text-gray-700 text-lg">
              Geen materialen gevonden
            </h4>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              We konden geen materialen vinden die voldoen aan uw criteria. Probeer uw filters te wijzigen of zoek naar iets anders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => {
              const available = getAvailableQuantity(material);
              const category = categories.find((c) => c.id === material.categoryId);
              const isAvailable = available > 0;

              return (
                <motion.div
                  key={material.id}
                  layoutId={`material-card-${material.id}`}
                  className={`bg-white rounded-2xl overflow-hidden border transition-all flex flex-col justify-between card-shadow ${
                    isAvailable
                      ? "border-white hover:border-summa-rose/30 hover:scale-[1.01] hover:shadow-md cursor-pointer"
                      : "border-gray-200/60 opacity-75 bg-gray-50/50"
                  }`}
                  onClick={() => isAvailable && handleSelectMaterial(material)}
                >
                  <div>
                    {/* Image Container */}
                    <div className="h-44 bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                      {material.optionalImageUrl ? (
                        <img
                          src={material.optionalImageUrl}
                          alt={material.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.className = "hidden";
                          }}
                        />
                      ) : (
                        <div className="text-gray-300 flex flex-col items-center">
                          <PackageOpen className="w-12 h-12" />
                          <span className="text-xs mt-1 font-mono text-gray-400">Geen afbeelding</span>
                        </div>
                      )}

                      {/* Stock overlay */}
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow ${
                          isAvailable
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {isAvailable ? `${available} Beschikbaar` : "Volledig Uitgeleend"}
                      </span>

                      {/* Category Badge */}
                      {category && (
                        <span className="absolute bottom-3 left-3 bg-summa-indigo/90 backdrop-blur-sm text-white px-3 py-0.5 rounded-lg text-xs font-semibold">
                          {category.name}
                        </span>
                      )}
                    </div>

                    {/* Text Area */}
                    <div className="p-5 space-y-2">
                      <h4 className="font-display font-extrabold text-gray-900 text-lg leading-tight">
                        {material.name}
                      </h4>
                      {material.notes && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {material.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-sm">
                    {material.optionalBarcode ? (
                      <span className="text-xs font-mono text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5" title="Barcode">
                        ||| {material.optionalBarcode}
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-gray-300">Geen barcode</span>
                    )}

                    {isAvailable ? (
                      <span className="text-xs sm:text-sm font-bold text-summa-indigo hover:text-summa-rose transition-colors flex items-center space-x-1">
                        <span>{currentRole ? "Leen uit" : "Lenen"}</span>
                        <span>&rarr;</span>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400">Niet beschikbaar</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lending or Authentication Modal */}
      <AnimatePresence>
        {selectedMaterial && (
          <div className="fixed inset-0 bg-summa-indigo/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
            >
              {/* Modal Header */}
              <div className="bg-summa-indigo text-white p-6 relative">
                <button
                  type="button"
                  onClick={() => setSelectedMaterial(null)}
                  className="absolute top-4 right-4 text-indigo-200 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  ✕
                </button>
                <span className="text-xs font-mono uppercase bg-summa-rose px-2.5 py-1 rounded-md font-bold tracking-wide">
                  {currentRole ? "Uitleen Registreren" : "Sleuteloverdracht"}
                </span>
                <h3 className="font-display font-bold text-xl mt-3 leading-tight">
                  {selectedMaterial.name}
                </h3>
              </div>

              {/* Modal Content */}
              {!currentRole ? (
                /* 1. If not logged in, ask the medewerker to enter their PIN */
                <form onSubmit={handleInlinePinSubmit} className="p-6 space-y-6">
                  {pinError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium text-center">
                      {pinError}
                    </div>
                  )}

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Lening registreren vereist dat een medewerker inlogt met hun pincode.
                    </p>
                    
                    {/* Role Selection inside PIN screen */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl text-xs font-bold text-gray-700 mt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRoleForPin("uitlener")}
                        className={`py-2 rounded-lg cursor-pointer transition-colors ${
                          selectedRoleForPin === "uitlener"
                            ? "bg-summa-indigo text-white"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        Inloggen als Uitlener
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRoleForPin("admin")}
                        className={`py-2 rounded-lg cursor-pointer transition-colors ${
                          selectedRoleForPin === "admin"
                            ? "bg-summa-indigo text-white"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        Inloggen als Admin
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-center">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Voer pincode in (Medewerker)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••"
                      className="block w-36 mx-auto text-center py-2.5 text-2xl font-mono tracking-widest border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo text-gray-900 bg-gray-50/50"
                      autoFocus
                      required
                    />
                    <p className="text-[10px] text-gray-400 font-mono">
                      Tip: gebruik pincode 1234
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMaterial(null)}
                      className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Annuleren
                    </button>
                    <button
                      type="submit"
                      className="py-2.5 bg-summa-indigo hover:bg-indigo-950 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Controleren
                    </button>
                  </div>
                </form>
              ) : (
                /* 2. If logged in, fill in Customer details */
                <form onSubmit={handleConfirmLoan} className="p-6 space-y-5">
                  
                  {/* Customer details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Gegevens van de klant (Lener)
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">
                        Voornaam klant *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Bijv. Mark"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo text-sm bg-gray-50/20"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">
                        Opleiding klant *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Award className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Bijv. ICT Beheerder M4 of Sport & Bewegen"
                          value={customerTeam}
                          onChange={(e) => setCustomerTeam(e.target.value)}
                          className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo text-sm bg-gray-50/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Automatically logged date & time */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Uitleendatum & tijd:</span>
                    </span>
                    <strong className="text-gray-700 font-mono">{currentTimeStr}</strong>
                  </div>

                  {/* Touch Quantity Selector */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Maximale voorraad:</span>
                      <strong className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {getAvailableQuantity(selectedMaterial)} stuks
                      </strong>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-4 pt-1">
                      <button
                        type="button"
                        disabled={borrowQuantity <= 1}
                        onClick={() => setBorrowQuantity((prev) => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-lg font-bold flex items-center justify-center transition-all cursor-pointer"
                      >
                        －
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={getAvailableQuantity(selectedMaterial)}
                        value={borrowQuantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const maxVal = getAvailableQuantity(selectedMaterial);
                          if (isNaN(val)) return;
                          if (val < 1) setBorrowQuantity(1);
                          else if (val > maxVal) setBorrowQuantity(maxVal);
                          else setBorrowQuantity(val);
                        }}
                        className="w-16 text-center py-1.5 text-xl font-display font-bold text-summa-indigo border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo"
                      />
                      <button
                        type="button"
                        disabled={borrowQuantity >= getAvailableQuantity(selectedMaterial)}
                        onClick={() =>
                          setBorrowQuantity((prev) =>
                            Math.min(getAvailableQuantity(selectedMaterial), prev + 1)
                          )
                        }
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-lg font-bold flex items-center justify-center transition-all cursor-pointer"
                      >
                        ＋
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setSelectedMaterial(null)}
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                    >
                      Annuleren
                    </button>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-summa-rose hover:bg-summa-rose/95 text-white rounded-xl text-xs font-display font-bold shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                      Uitleen Bevestigen
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
