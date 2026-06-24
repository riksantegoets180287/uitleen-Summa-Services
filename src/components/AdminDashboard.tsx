import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  FolderKanban,
  ClipboardCheck,
  History,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  TrendingUp,
  Boxes,
  Tag,
  AlertTriangle,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  PackageCheck,
  FileSpreadsheet
} from "lucide-react";
import { Category, Material, Loan } from "../types";

interface AdminDashboardProps {
  categories: Category[];
  materials: Material[];
  loans: Loan[];
  onAddMaterial: (material: Omit<Material, "id" | "createdAt">) => void;
  onEditMaterial: (id: string, material: Omit<Material, "id" | "createdAt">) => void;
  onDeleteMaterial: (id: string) => void;
  onAddCategory: (name: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onReturnLoan: (loanId: string) => void;
}

type AdminTab = "materialen" | "categorieen" | "uitgeleend" | "historie";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  materials,
  loans,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReturnLoan,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("materialen");

  // Material Form state
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialForm, setMaterialForm] = useState({
    name: "",
    categoryId: "",
    totalQuantity: 1,
    optionalBarcode: "",
    optionalImageUrl: "",
    notes: "",
  });

  // Category Edit state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryInputName, setCategoryInputName] = useState("");

  // History Filter states
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<"all" | "uitgeleend" | "teruggebracht">("all");
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState("all");
  const [historyTeamFilter, setHistoryTeamFilter] = useState("all");

  // Active Loan Search state
  const [activeLoanSearch, setActiveLoanSearch] = useState("");

  // Material Search state
  const [materialSearch, setMaterialSearch] = useState("");

  // Active loan count helper per material
  const getActiveLoanCount = (materialId: string) => {
    return loans
      .filter((l) => l.materialId === materialId && l.status === "uitgeleend")
      .reduce((sum, l) => sum + l.quantity, 0);
  };

  // Metrics calculations
  const totalMaterialsCount = materials.length;
  
  const activeLoansCount = loans.filter((l) => l.status === "uitgeleend").length;
  const activeLoansItemsCount = loans
    .filter((l) => l.status === "uitgeleend")
    .reduce((sum, l) => sum + l.quantity, 0);

  const categoriesCount = categories.length;

  const lowStockMaterials = useMemo(() => {
    return materials.filter((m) => {
      const active = getActiveLoanCount(m.id);
      const available = m.totalQuantity - active;
      return available <= 1; // 0 or 1 item left
    });
  }, [materials, loans]);

  // Open Add Material Modal
  const handleOpenAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm({
      name: "",
      categoryId: categories[0]?.id || "",
      totalQuantity: 1,
      optionalBarcode: "",
      optionalImageUrl: "",
      notes: "",
    });
    setIsMaterialModalOpen(true);
  };

  // Open Edit Material Modal
  const handleOpenEditMaterial = (m: Material) => {
    setEditingMaterial(m);
    setMaterialForm({
      name: m.name,
      categoryId: m.categoryId,
      totalQuantity: m.totalQuantity,
      optionalBarcode: m.optionalBarcode || "",
      optionalImageUrl: m.optionalImageUrl || "",
      notes: m.notes || "",
    });
    setIsMaterialModalOpen(true);
  };

  // Material Submit
  const handleMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.name.trim()) {
      alert("Vul een naam in voor het materiaal.");
      return;
    }
    if (!materialForm.categoryId) {
      alert("Selecteer een categorie.");
      return;
    }
    if (materialForm.totalQuantity < 1) {
      alert("Totaal aantal moet minimaal 1 zijn.");
      return;
    }

    const payload = {
      name: materialForm.name.trim(),
      categoryId: materialForm.categoryId,
      totalQuantity: Number(materialForm.totalQuantity),
      optionalBarcode: materialForm.optionalBarcode.trim() || undefined,
      optionalImageUrl: materialForm.optionalImageUrl.trim() || undefined,
      notes: materialForm.notes.trim() || undefined,
    };

    if (editingMaterial) {
      onEditMaterial(editingMaterial.id, payload);
    } else {
      onAddMaterial(payload);
    }

    setIsMaterialModalOpen(false);
  };

  // Category Submit (Add)
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryInputName.trim()) {
      alert("Vul een categorienaam in.");
      return;
    }
    // Check duplication
    if (categories.some((c) => c.name.toLowerCase() === categoryInputName.trim().toLowerCase())) {
      alert("Deze categorie bestaat al.");
      return;
    }
    onAddCategory(categoryInputName.trim());
    setCategoryInputName("");
  };

  // Category Submit (Edit)
  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!newCategoryName.trim()) {
      alert("Vul een categorienaam in.");
      return;
    }
    onEditCategory(editingCategory.id, newCategoryName.trim());
    setEditingCategory(null);
    setNewCategoryName("");
  };

  // Category Delete Check
  const isCategoryDeletable = (catId: string) => {
    return !materials.some((m) => m.categoryId === catId);
  };

  // Unique Teams extracted from loans for history filtering
  const uniqueTeamsList = useMemo(() => {
    const teams = new Set<string>();
    loans.forEach((l) => {
      if (l.borrowerTeam) teams.add(l.borrowerTeam);
    });
    return Array.from(teams);
  }, [loans]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    return loans.filter((l) => {
      const matchStatus =
        historyStatusFilter === "all" || l.status === historyStatusFilter;
      const matchCategory =
        historyCategoryFilter === "all" || l.categoryName === historyCategoryFilter;
      const matchTeam =
        historyTeamFilter === "all" || l.borrowerTeam === historyTeamFilter;

      const cleanSearch = historySearch.trim().toLowerCase();
      const matchSearch =
        l.borrowerName.toLowerCase().includes(cleanSearch) ||
        l.materialName.toLowerCase().includes(cleanSearch);

      return matchStatus && matchCategory && matchTeam && matchSearch;
    });
  }, [loans, historyStatusFilter, historyCategoryFilter, historyTeamFilter, historySearch]);

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    if (!materialSearch.trim()) return materials;
    const cleanSearch = materialSearch.toLowerCase();
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(cleanSearch) ||
        (m.optionalBarcode && m.optionalBarcode.includes(cleanSearch))
    );
  }, [materials, materialSearch]);

  // Filtered Active Loans
  const filteredActiveLoans = useMemo(() => {
    const active = loans.filter((l) => l.status === "uitgeleend");
    if (!activeLoanSearch.trim()) return active;
    const cleanSearch = activeLoanSearch.toLowerCase();
    return active.filter(
      (l) =>
        l.borrowerName.toLowerCase().includes(cleanSearch) ||
        l.materialName.toLowerCase().includes(cleanSearch) ||
        l.borrowerTeam.toLowerCase().includes(cleanSearch)
    );
  }, [loans, activeLoanSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-summa-indigo">
            Beheerders Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Hier beheert u alle beschikbare goederen, categorieën, actieve leningen en de complete historie.
          </p>
        </div>
      </div>

      {/* 2. Metrics Bento-grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Materials */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-summa-indigo rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
              Materialen in Systeem
            </span>
            <span className="text-2xl font-display font-extrabold text-gray-900 block mt-0.5">
              {totalMaterialsCount}
            </span>
          </div>
        </div>

        {/* Metric 2: Active Loans */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow flex items-center space-x-4">
          <div className="p-3 bg-pink-50 text-summa-rose rounded-xl">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
              Actieve Uitleningen
            </span>
            <span className="text-2xl font-display font-extrabold text-gray-900 block mt-0.5">
              {activeLoansCount} <span className="text-xs text-gray-400 font-sans font-normal">({activeLoansItemsCount} stuks)</span>
            </span>
          </div>
        </div>

        {/* Metric 3: Total Categories */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
              Aantal Categorieën
            </span>
            <span className="text-2xl font-display font-extrabold text-gray-900 block mt-0.5">
              {categoriesCount}
            </span>
          </div>
        </div>

        {/* Metric 4: Low Stock or Unavailable */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
              Lage of Geen Voorraad
            </span>
            <span className="text-2xl font-display font-extrabold text-gray-900 block mt-0.5">
              {lowStockMaterials.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-gray-100 card-shadow flex flex-wrap gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab("materialen")}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "materialen"
              ? "bg-summa-indigo text-white shadow-md shadow-indigo-950/20"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Materialen</span>
        </button>
        <button
          onClick={() => setActiveTab("categorieen")}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "categorieen"
              ? "bg-summa-indigo text-white shadow-md shadow-indigo-950/20"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Categorieën ({categoriesCount})</span>
        </button>
        <button
          onClick={() => setActiveTab("uitgeleend")}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "uitgeleend"
              ? "bg-summa-indigo text-white shadow-md shadow-indigo-950/20"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Terugbrengen ({activeLoansCount})</span>
        </button>
        <button
          onClick={() => setActiveTab("historie")}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "historie"
              ? "bg-summa-indigo text-white shadow-md shadow-indigo-950/20"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historie ({loans.length})</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      <div className="bg-white rounded-2xl p-6 card-shadow border border-gray-100 min-h-[400px]">
        {/* ==================== TAB: MATERIALEN ==================== */}
        {activeTab === "materialen" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Zoek materiaal of barcode..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo focus:border-summa-indigo text-sm"
                />
              </div>

              <button
                onClick={handleOpenAddMaterial}
                disabled={categories.length === 0}
                className="flex items-center justify-center space-x-1.5 bg-summa-rose hover:bg-summa-rose/95 disabled:bg-gray-300 disabled:pointer-events-none text-white font-display font-bold py-2.5 px-5 rounded-xl text-sm tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nieuw Materiaal</span>
              </button>
            </div>

            {/* Empty category alert */}
            {categories.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start space-x-3 max-w-2xl">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Geen categorieën gedefinieerd</h4>
                  <p className="text-xs mt-1 leading-relaxed">
                    U moet ten minste één categorie aanmaken voordat u materialen kunt toevoegen. Ga naar het tabblad <strong>Categorieën</strong> om een categorie aan te maken.
                  </p>
                  <button
                    onClick={() => setActiveTab("categorieen")}
                    className="mt-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    Maak nu een Categorie aan
                  </button>
                </div>
              </div>
            )}

            {filteredMaterials.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-medium">
                Geen materialen gevonden.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead className="bg-gray-50/75 text-gray-500 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Afbeelding</th>
                      <th className="px-6 py-4">Materiaal</th>
                      <th className="px-6 py-4">Categorie</th>
                      <th className="px-6 py-4">Barcode</th>
                      <th className="px-6 py-4 text-center">Voorraad</th>
                      <th className="px-6 py-4 text-right">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredMaterials.map((m) => {
                      const category = categories.find((c) => c.id === m.categoryId);
                      const activeLoansCount = getActiveLoanCount(m.id);
                      const available = m.totalQuantity - activeLoansCount;

                      return (
                        <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3 shrink-0 whitespace-nowrap">
                            {m.optionalImageUrl ? (
                              <img
                                src={m.optionalImageUrl}
                                alt={m.name}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-lg object-cover border border-gray-150"
                                onError={(e) => {
                                  e.currentTarget.src = "";
                                  e.currentTarget.className = "hidden";
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300">
                                <Boxes className="w-5 h-5" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <span className="font-semibold text-gray-950 block text-sm sm:text-base">
                              {m.name}
                            </span>
                            {m.notes && (
                              <span className="text-xs text-gray-400 block max-w-xs truncate" title={m.notes}>
                                {m.notes}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className="inline-block bg-indigo-50 text-summa-indigo font-medium px-2.5 py-0.5 rounded-md text-xs">
                              {category ? category.name : "Overig"}
                            </span>
                          </td>
                          <td className="px-6 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                            {m.optionalBarcode ? `||| ${m.optionalBarcode}` : "-"}
                          </td>
                          <td className="px-6 py-3 text-center whitespace-nowrap">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-sm font-bold text-gray-900">
                                {available} / {m.totalQuantity}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase">
                                Beschikbaar
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditMaterial(m)}
                              className="inline-flex p-2 text-indigo-600 hover:text-white hover:bg-summa-indigo rounded-lg transition-all cursor-pointer"
                              title="Bewerken"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Weet u zeker dat u "${m.name}" wilt verwijderen? Eventuele lopende leningen blijven in de historie bewaard.`
                                  )
                                ) {
                                  onDeleteMaterial(m.id);
                                }
                              }}
                              className="inline-flex p-2 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-all cursor-pointer"
                              title="Verwijderen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: CATEGORIEEN ==================== */}
        {activeTab === "categorieen" && (
          <div className="space-y-8">
            {/* Add Category Form */}
            <form onSubmit={handleAddCategorySubmit} className="max-w-md bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-3">
              <h3 className="font-display font-bold text-gray-900 text-sm tracking-wide uppercase text-gray-500">
                Nieuwe Categorie Toevoegen
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Bijv. Audio & Visueel"
                  value={categoryInputName}
                  onChange={(e) => setCategoryInputName(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-summa-indigo focus:border-summa-indigo"
                />
                <button
                  type="submit"
                  className="bg-summa-indigo hover:bg-indigo-900 text-white font-display font-bold px-5 rounded-xl text-sm transition-all shadow cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Toevoegen</span>
                </button>
              </div>
            </form>

            {/* Categories List */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-gray-900 text-lg">
                Geregistreerde Categorieën ({categories.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const linkedMaterialsCount = materials.filter((m) => m.categoryId === cat.id).length;
                  const deletable = isCategoryDeletable(cat.id);
                  const isEditingThis = editingCategory?.id === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-xs"
                    >
                      {isEditingThis ? (
                        <form
                          onSubmit={handleEditCategorySubmit}
                          className="flex items-center gap-2 w-full"
                        >
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm bg-gray-50"
                            required
                          />
                          <button
                            type="submit"
                            className="bg-emerald-600 text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
                          >
                            Bewaar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(null);
                              setNewCategoryName("");
                            }}
                            className="text-gray-400 hover:text-gray-600 text-xs px-1.5 py-1"
                          >
                            Annuleer
                          </button>
                        </form>
                      ) : (
                        <>
                          <div>
                            <h4 className="font-bold text-gray-900 text-base">{cat.name}</h4>
                            <p className="text-xs text-gray-400">
                              {linkedMaterialsCount} gekoppelde materialen
                            </p>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setNewCategoryName(cat.name);
                              }}
                              className="p-1.5 text-gray-400 hover:text-summa-indigo hover:bg-gray-50 rounded-lg transition-colors"
                              title="Naam bewerken"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={!deletable}
                              onClick={() => {
                                if (confirm(`Weet u zeker dat u de categorie "${cat.name}" wilt verwijderen?`)) {
                                  onDeleteCategory(cat.id);
                                }
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                deletable
                                  ? "text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  : "text-gray-200 cursor-not-allowed"
                              }`}
                              title={
                                deletable
                                  ? "Verwijderen"
                                  : "Kan niet worden verwijderd: er zijn nog materialen gekoppeld aan deze categorie."
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: UITGELEEND ==================== */}
        {activeTab === "uitgeleend" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Zoek op degene die het heeft geleend, of opleiding..."
                  value={activeLoanSearch}
                  onChange={(e) => setActiveLoanSearch(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo focus:border-summa-indigo text-sm"
                />
              </div>
            </div>

            {filteredActiveLoans.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-medium">
                Geen actieve uitleningen gevonden.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead className="bg-gray-50/75 text-gray-500 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Lener & Team</th>
                      <th className="px-6 py-4">Materiaal</th>
                      <th className="px-6 py-4">Categorie</th>
                      <th className="px-6 py-4 text-center">Aantal</th>
                      <th className="px-6 py-4">Datum & Tijd</th>
                      <th className="px-6 py-4 text-right">Teruggebracht</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredActiveLoans.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-950 block text-sm sm:text-base">
                            {l.borrowerName}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Team: <strong>{l.borrowerTeam}</strong>
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {l.materialName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block bg-indigo-50 text-summa-indigo px-2.5 py-0.5 rounded-md text-xs font-semibold">
                            {l.categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-gray-900 whitespace-nowrap">
                          {l.quantity}x
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{l.borrowedAtDate} om {l.borrowedAtTime}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (confirm(`Weet u zeker dat u de ${l.quantity}x "${l.materialName}" van lener ${l.borrowerName} wilt markeren als teruggebracht?`)) {
                                onReturnLoan(l.id);
                              }
                            }}
                            className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Retour ontvangen</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: HISTORIE ==================== */}
        {activeTab === "historie" && (
          <div className="space-y-6">
            {/* Advanced Filters */}
            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* Search */}
                <div className="flex-1 w-full space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Zoek op lener of materiaal
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Bijv. Jan de Vries of Laptop..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="block w-full bg-white pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo text-sm"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="w-full md:w-44 space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Status
                  </label>
                  <select
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value as any)}
                    className="block w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-summa-indigo"
                  >
                    <option value="all">Alle Statussen</option>
                    <option value="uitgeleend">Uitgeleend</option>
                    <option value="teruggebracht">Teruggebracht</option>
                  </select>
                </div>

                {/* Category */}
                <div className="w-full md:w-48 space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Categorie
                  </label>
                  <select
                    value={historyCategoryFilter}
                    onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                    className="block w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-summa-indigo"
                  >
                    <option value="all">Alle Categorieën</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team */}
                <div className="w-full md:w-48 space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Team / Afdeling
                  </label>
                  <select
                    value={historyTeamFilter}
                    onChange={(e) => setHistoryTeamFilter(e.target.value)}
                    className="block w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-summa-indigo"
                  >
                    <option value="all">Alle Teams</option>
                    {uniqueTeamsList.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-medium">
                Geen transactiegeschiedenis gevonden die voldoet aan uw filters.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead className="bg-gray-50/75 text-gray-500 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Lener & Team</th>
                      <th className="px-6 py-4">Materiaal</th>
                      <th className="px-6 py-4">Aantal</th>
                      <th className="px-6 py-4">Uitgeleend op</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Retour op</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredHistory.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-950 block text-sm sm:text-base">
                            {l.borrowerName}
                          </span>
                          <span className="text-xs text-gray-400 block">
                            {l.borrowerTeam}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900 block">{l.materialName}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 inline-block mt-0.5">{l.categoryName}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-950 whitespace-nowrap">
                          {l.quantity}x
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {l.borrowedAtDate} om {l.borrowedAtTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {l.status === "uitgeleend" ? (
                            <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200/50 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Uitgeleend</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Ingeleverd</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                          {l.returnedAt ? l.returnedAt : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Material Form Modal (Add / Edit) */}
      <AnimatePresence>
        {isMaterialModalOpen && (
          <div className="fixed inset-0 bg-summa-indigo/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100"
            >
              {/* Header */}
              <div className="bg-summa-indigo text-white p-6 relative">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="absolute top-4 right-4 text-indigo-200 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
                <h3 className="font-display font-bold text-xl leading-tight">
                  {editingMaterial ? `Materiaal Bewerken: ${editingMaterial.name}` : "Nieuw Materiaal Toevoegen"}
                </h3>
                <p className="text-xs text-indigo-200 mt-1">
                  Vul de productspecificaties en voorraadaantallen in.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleMaterialSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Materiaal Naam <span className="text-summa-rose">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bijv. Laptop oplader 65W USB-C"
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-summa-indigo text-gray-900"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Categorie <span className="text-summa-rose">*</span>
                  </label>
                  <select
                    required
                    value={materialForm.categoryId}
                    onChange={(e) => setMaterialForm({ ...materialForm, categoryId: e.target.value })}
                    className="block w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-summa-indigo text-gray-900 bg-white"
                  >
                    <option value="" disabled>Selecteer categorie...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Total Quantity */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Totale Voorraad <span className="text-summa-rose">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="10"
                      value={materialForm.totalQuantity}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          totalQuantity: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-summa-indigo text-gray-900"
                    />
                  </div>

                  {/* Optional Barcode */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Barcode <span className="text-gray-400">(Optioneel)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Bijv. 87112003"
                      value={materialForm.optionalBarcode}
                      onChange={(e) => setMaterialForm({ ...materialForm, optionalBarcode: e.target.value })}
                      className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-summa-indigo text-gray-900"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Afbeelding URL <span className="text-gray-400">(Optioneel)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="Bijv. https://images.unsplash.com/..."
                    value={materialForm.optionalImageUrl}
                    onChange={(e) => setMaterialForm({ ...materialForm, optionalImageUrl: e.target.value })}
                    className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-summa-indigo text-gray-900"
                  />
                  <p className="text-[10px] text-gray-400">
                    Voer een geldige weblink naar een afbeelding in om een preview te tonen op de kaart.
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Aanvullende Notities <span className="text-gray-400">(Optioneel)</span>
                  </label>
                  <textarea
                    placeholder="Bijv. Locatie: Kast B2, inclusief opbergtas."
                    rows={2}
                    value={materialForm.notes}
                    onChange={(e) => setMaterialForm({ ...materialForm, notes: e.target.value })}
                    className="block w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-summa-indigo text-gray-900"
                  />
                </div>

                {/* Form Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsMaterialModalOpen(false)}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors cursor-pointer"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="w-full py-3 bg-summa-rose hover:bg-summa-rose/95 text-white rounded-xl text-sm font-display font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    {editingMaterial ? "Wijzigingen opslaan" : "Materiaal toevoegen"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
