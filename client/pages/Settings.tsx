import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calculator,
  Calendar,
  Hash,
  Users,
  BookOpen,
  Receipt,
  HardDrive,
  Palette,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { Settings } from "@/types/settings";
import { MOCK_SETTINGS } from "@/data/mockSettingsData";
import { CompanyInfoSection } from "@/components/settings/CompanyInfoSection";
import { AccountingParamsSection } from "@/components/settings/AccountingParamsSection";
import { PeriodManagementSection } from "@/components/settings/PeriodManagementSection";
import { DocumentNumberingSection } from "@/components/settings/DocumentNumberingSection";
import { UserManagementSection } from "@/components/settings/UserManagementSection";
import { ChartOfAccountsSection } from "@/components/settings/ChartOfAccountsSection";
import { TaxConfigurationSection } from "@/components/settings/TaxConfigurationSection";
import { BackupRestoreSection } from "@/components/settings/BackupRestoreSection";
import { InterfacePreferencesSection } from "@/components/settings/InterfacePreferencesSection";
import { DIANConfigurationSection } from "@/components/settings/DIANConfigurationSection";

export default function Settings() {
  const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);
  const [activeTab, setActiveTab] = useState('company');

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('app_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Parse dates
        if (parsed.company?.constitutionDate) {
          parsed.company.constitutionDate = new Date(parsed.company.constitutionDate);
        }
        setSettings(parsed);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    } else {
      // Initialize with mock data
      localStorage.setItem('app_settings', JSON.stringify(MOCK_SETTINGS));
    }
  }, []);

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
  };

  return (
    <AppLayout pageTitle="Configuración">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-2">
            Administra la información de tu empresa, parámetros contables y preferencias del sistema
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="accounting" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Contable</span>
            </TabsTrigger>
            <TabsTrigger value="periods" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Períodos</span>
            </TabsTrigger>
            <TabsTrigger value="numbering" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span className="hidden sm:inline">Numeración</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Cuentas</span>
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Impuestos</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              <span className="hidden sm:inline">Backup</span>
            </TabsTrigger>
            <TabsTrigger value="interface" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Interfaz</span>
            </TabsTrigger>
            <TabsTrigger value="dian" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">DIAN</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <CompanyInfoSection
              company={settings.company}
              onUpdate={(company) => updateSettings({ ...settings, company })}
            />
          </TabsContent>

          <TabsContent value="accounting">
            <AccountingParamsSection
              params={settings.accounting}
              onUpdate={(accounting) => updateSettings({ ...settings, accounting })}
            />
          </TabsContent>

          <TabsContent value="periods">
            <PeriodManagementSection
              periods={settings.periods}
              onUpdate={(periods) => updateSettings({ ...settings, periods })}
            />
          </TabsContent>

          <TabsContent value="numbering">
            <DocumentNumberingSection
              numbering={settings.numbering}
              onUpdate={(numbering) => updateSettings({ ...settings, numbering })}
            />
          </TabsContent>

          <TabsContent value="users">
            <UserManagementSection
              users={settings.users}
              onUpdate={(users) => updateSettings({ ...settings, users })}
            />
          </TabsContent>

          <TabsContent value="accounts">
            <ChartOfAccountsSection
              accounts={settings.chartOfAccounts}
              onUpdate={(chartOfAccounts) => updateSettings({ ...settings, chartOfAccounts })}
            />
          </TabsContent>

          <TabsContent value="tax">
            <TaxConfigurationSection
              tax={settings.tax}
              onUpdate={(tax) => updateSettings({ ...settings, tax })}
            />
          </TabsContent>

          <TabsContent value="backup">
            <BackupRestoreSection
              backup={settings.backup}
              onUpdate={(backup) => updateSettings({ ...settings, backup })}
            />
          </TabsContent>

          <TabsContent value="interface">
            <InterfacePreferencesSection
              prefs={settings.interface}
              onUpdate={(interfacePrefs) => updateSettings({ ...settings, interface: interfacePrefs })}
            />
          </TabsContent>

          <TabsContent value="dian">
            <DIANConfigurationSection
              dian={settings.tax.dian}
              onUpdate={(dian) => updateSettings({
                ...settings,
                tax: { ...settings.tax, dian }
              })}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
