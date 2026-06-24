import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ClipboardCheck, Clock, CheckCircle, PackageCheck, HelpCircle, CornerDownLeft, Award, User } from "lucide-react";
import { Loan } from "../types";

interface TerugbrengenProps {
  loans: Loan[];
  onReturnLoan: (loanId: string) => void;
}

export const Terugbrengen: React.FC<TerugbrengenProps> = ({ loans, onReturnLoan }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter only active loans ("uitgeleend") based on search query
  const activeLoans = useMemo(() => {
    const active = loans.filter((l) => l.status === "uitgeleend");
    if (!searchQuery.trim()) return active;
    
    const cleanSearch = searchQuery.toLowerCase();
    return active.filter(
      (l) =>
        l.borrowerName.toLowerCase().includes(cleanSearch) ||
        l.borrowerTeam.toLowerCase().includes(cleanSearch) ||
        l.materialName.toLowerCase().includes(cleanSearch)
    );
  }, [loans, searchQuery]);

  // Handle returning a loan with a visual feedback prompt
  const handleReturnClick = (loan: Loan) => {
    if (
      confirm(
        `Weet u zeker dat u de ${loan.quantity}x "${loan.materialName}" geleend door ${loan.borrowerName} wilt markeren als RETOUR (Teruggebracht)?`
      )
    ) {
      onReturnLoan(loan.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* Header Info */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-summa-indigo">
          Producten Terugbrengen
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Zoek op de naam van degene die het heeft geleend, hun opleiding of het product om een lening te beëindigen.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 card-shadow border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Zoek op voornaam lener, opleiding of productnaam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo focus:border-summa-indigo text-sm text-gray-900 placeholder-gray-400 bg-gray-50/20 transition-all font-medium"
            autoFocus
          />
        </div>
      </div>

      {/* List of active loans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display font-bold text-gray-800 text-lg">
            Actieve Uitleningen ({activeLoans.length})
          </h3>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-summa-rose hover:underline font-semibold cursor-pointer"
            >
              Wis filters
            </button>
          )}
        </div>

        {activeLoans.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 card-shadow max-w-lg mx-auto">
            <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="font-display font-bold text-gray-700 text-lg">
              Geen openstaande uitleningen
            </h4>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              Er zijn momenteel geen actieve uitleningen die overeenkomen met uw zoekopdracht. Iedereen heeft alles keurig ingeleverd!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {activeLoans.map((loan) => (
                <motion.div
                  key={loan.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl p-5 border border-gray-150/60 card-shadow flex flex-col justify-between hover:border-summa-rose/20 transition-all relative overflow-hidden"
                >
                  {/* Rose tag accent on side */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-summa-rose" />

                  {/* Loan Details content */}
                  <div className="space-y-4 pl-1.5">
                    
                    {/* Header: Borrower Info */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs text-summa-indigo font-bold tracking-wide uppercase bg-indigo-50 py-1 px-2.5 rounded-lg w-max">
                        <User className="w-3.5 h-3.5 text-summa-rose shrink-0" />
                        <span>Klant</span>
                      </div>
                      <h4 className="font-display font-extrabold text-gray-950 text-xl leading-tight">
                        {loan.borrowerName}
                      </h4>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Award className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Opleiding: <strong className="text-gray-700">{loan.borrowerTeam}</strong></span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Product Borrowed Info */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Geleend Item
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-gray-800 text-sm leading-snug">
                            {loan.materialName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 font-semibold">
                            Categorie: {loan.categoryName}
                          </p>
                        </div>
                        <span className="bg-summa-indigo text-white font-mono font-bold text-xs px-2.5 py-1 rounded-lg shrink-0">
                          {loan.quantity}x
                        </span>
                      </div>
                    </div>

                    {/* Date details */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center space-x-2 text-xs text-gray-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Sinds: {loan.borrowedAtDate} om {loan.borrowedAtTime}</span>
                    </div>
                  </div>

                  {/* Return button */}
                  <div className="mt-5 pt-3 border-t border-gray-100 pl-1.5">
                    <button
                      onClick={() => handleReturnClick(loan)}
                      className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99] text-white font-display font-bold py-2.5 px-4 rounded-xl text-xs tracking-wide shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4 shrink-0" />
                      <span>Retour Melden</span>
                    </button>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
};
