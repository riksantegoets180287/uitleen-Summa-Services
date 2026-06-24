import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, ArrowLeft, KeyRound } from "lucide-react";

interface AdminPinScreenProps {
  onSuccess: () => void;
  onGoBack: () => void;
}

export const AdminPinScreen: React.FC<AdminPinScreenProps> = ({
  onSuccess,
  onGoBack,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      setError("");
      onSuccess();
    } else {
      setError("Onjuiste pincode. Probeer het opnieuw (Tip: gebruik 1234).");
      setPin("");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-2xl card-shadow overflow-hidden border border-gray-150/60"
      >
        <div className="bg-summa-indigo px-6 py-8 text-center text-white relative">
          <button
            onClick={onGoBack}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Terug naar start"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="inline-flex p-3 bg-white/10 rounded-xl mb-3">
            <Lock className="w-6 h-6 text-summa-rose" />
          </div>
          <h2 className="text-2xl font-display font-bold">Beheerders Toegang</h2>
          <p className="text-xs text-indigo-200 mt-1">
            Voer de pincode in om toegang te krijgen tot het dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium animate-shake text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 text-center" htmlFor="pin">
              Pincode beheerder
            </label>
            
            {/* Simple centered large digit input */}
            <input
              type="password"
              id="pin"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="block w-40 mx-auto text-center py-3 text-3xl font-mono tracking-widest border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-summa-indigo focus:border-summa-indigo text-gray-900 bg-gray-50/50"
              autoFocus
              required
            />
            
            <p className="text-center text-xs text-gray-400">
              Uitsluitend voor medewerkers en beheerders. (Demo PIN: <strong className="text-summa-indigo font-mono">1234</strong>)
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-summa-indigo hover:bg-indigo-900 text-white font-display font-bold py-3 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Toegang Controleren</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
