import React, { createContext, useState, useCallback, useEffect } from "react";

export interface Company {
  id: string;
  name: string;
  nit: string;
  type: "NATURAL" | "JURIDICAL";
  fiscalYear?: string;
  currency?: "COP" | "USD" | "EUR";
  active: boolean;
}

interface CompanyContextType {
  currentCompany: Company | null;
  companies: Company[];
  selectCompany: (companyId: string) => void;
  createCompany: (company: Omit<Company, "id">) => Promise<void>;
  updateCompany: (companyId: string, updates: Partial<Company>) => Promise<void>;
}

export const CompanyContext = createContext<CompanyContextType | undefined>(
  undefined
);

// Mock data - Replace with actual API calls
const MOCK_COMPANIES: Company[] = [
  {
    id: "company-1",
    name: "Mi Empresa S.A.S.",
    nit: "123456789-0",
    type: "JURIDICAL",
    fiscalYear: "2024",
    currency: "COP",
    active: true,
  },
  {
    id: "company-2",
    name: "Consultoria XYZ",
    nit: "987654321-0",
    type: "JURIDICAL",
    fiscalYear: "2024",
    currency: "COP",
    active: true,
  },
];

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(
    MOCK_COMPANIES[0]
  );

  // Load selected company from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selectedCompanyId");
    if (saved) {
      const found = companies.find((c) => c.id === saved);
      if (found) {
        setCurrentCompany(found);
      }
    }
  }, [companies]);

  const selectCompany = useCallback((companyId: string) => {
    const found = companies.find((c) => c.id === companyId);
    if (found) {
      setCurrentCompany(found);
      localStorage.setItem("selectedCompanyId", companyId);
    }
  }, [companies]);

  const createCompany = useCallback(
    async (company: Omit<Company, "id">) => {
      // TODO: Replace with actual API call
      const newCompany: Company = {
        ...company,
        id: "company-" + Date.now(),
      };
      setCompanies((prev) => [...prev, newCompany]);
      setCurrentCompany(newCompany);
    },
    []
  );

  const updateCompany = useCallback(
    async (companyId: string, updates: Partial<Company>) => {
      // TODO: Replace with actual API call
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, ...updates } : c))
      );
      if (currentCompany?.id === companyId) {
        setCurrentCompany((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [currentCompany?.id]
  );

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        companies: companies.filter((c) => c.active),
        selectCompany,
        createCompany,
        updateCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}
