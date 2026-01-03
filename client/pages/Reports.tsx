import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import type { JournalEntry } from "@/types/journalEntry";
import { LibroDiario } from "@/components/reports/LibroDiario";
import { BalanceComprobacion } from "@/components/reports/BalanceComprobacion";
import { LibroMayor } from "@/components/reports/LibroMayor";

// Mock journal entries (in production, fetch from backend)
import { MOCK_ENTRIES } from "@/pages/JournalEntries";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("libro-diario");

  // Filter only POSTED entries for reports
  const postedEntries = useMemo(
    () => MOCK_ENTRIES.filter((entry) => entry.status === "POSTED"),
    []
  );

  return (
    <AppLayout pageTitle="Reportes Contables">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Reportes Contables</h1>
          <p className="text-muted-foreground mt-2">
            Reportes financieros según normativa colombiana
          </p>
        </div>

        {/* Report Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="libro-diario">Libro Diario</TabsTrigger>
            <TabsTrigger value="balance-comprobacion">
              Balance de Comprobación
            </TabsTrigger>
            <TabsTrigger value="libro-mayor">Libro Mayor</TabsTrigger>
          </TabsList>

          {/* Libro Diario Tab */}
          <TabsContent value="libro-diario" className="space-y-4">
            <LibroDiario entries={postedEntries} />
          </TabsContent>

          {/* Balance de Comprobación Tab */}
          <TabsContent value="balance-comprobacion" className="space-y-4">
            <BalanceComprobacion entries={postedEntries} />
          </TabsContent>

          {/* Libro Mayor Tab */}
          <TabsContent value="libro-mayor" className="space-y-4">
            <LibroMayor entries={postedEntries} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// Export MOCK_ENTRIES from JournalEntries for reuse
export { MOCK_ENTRIES };
