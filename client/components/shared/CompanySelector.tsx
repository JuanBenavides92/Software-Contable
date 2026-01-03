import { useState } from "react";
import { useCompany } from "@/hooks/useCompany";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, Plus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanySelectorProps {
  variant?: "header" | "sidebar" | "standalone";
  showLabel?: boolean;
}

export function CompanySelector({
  variant = "header",
  showLabel = true,
}: CompanySelectorProps) {
  const { currentCompany, companies, selectCompany } = useCompany();
  const [open, setOpen] = useState(false);

  if (!currentCompany) {
    return null;
  }

  const headerVariant = variant === "header";
  const sidebarVariant = variant === "sidebar";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "transition-all duration-200",
            headerVariant && "flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg",
            sidebarVariant && "w-full justify-between px-4 py-3 mb-4 hover:bg-sidebar-accent rounded-lg border border-sidebar-border"
          )}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {showLabel && (
              <div className="text-left">
                {headerVariant && (
                  <>
                    <span className="text-xs text-muted-foreground block">Empresa</span>
                    <span className="text-sm font-semibold">{currentCompany.name}</span>
                  </>
                )}
                {sidebarVariant && (
                  <span className="text-sm font-medium text-sidebar-foreground truncate">
                    {currentCompany.name}
                  </span>
                )}
              </div>
            )}
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform duration-200",
            open && "rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={headerVariant ? "end" : "start"} className="w-72">
        <DropdownMenuLabel className="px-2 py-1.5">
          <div>
            <p className="text-sm font-semibold">Selecciona una empresa</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {companies.length} empresa{companies.length !== 1 ? "s" : ""} activa{companies.length !== 1 ? "s" : ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-72 overflow-y-auto">
          {companies.map((company) => {
            const isSelected = currentCompany.id === company.id;
            return (
              <DropdownMenuItem
                key={company.id}
                onClick={() => {
                  selectCompany(company.id);
                  setOpen(false);
                }}
                className={cn(
                  "cursor-pointer px-2 py-3 mx-1 rounded-md transition-colors duration-150 my-1",
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      NIT: {company.nit}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {company.type === "JURIDICAL" ? "Jurídica" : "Natural"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {company.fiscalYear}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2 text-primary hover:bg-primary/10"
          onClick={() => {
            // TODO: Open create company dialog
            setOpen(false);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Crear nueva empresa</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
