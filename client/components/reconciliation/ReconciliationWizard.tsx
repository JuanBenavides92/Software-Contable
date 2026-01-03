import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import type {
    BankAccount,
    AccountingMovement,
    BankMovement,
    MatchedMovement,
    BankReconciliation,
} from "@/types/reconciliation";
import { ReconciliationStep1Config } from "./ReconciliationStep1Config";
import { ReconciliationStep2Matching } from "./ReconciliationStep2Matching";
import { ReconciliationStep3Report } from "./ReconciliationStep3Report";

interface ReconciliationWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (reconciliation: BankReconciliation) => void;
}

export function ReconciliationWizard({
    open,
    onOpenChange,
    onComplete,
}: ReconciliationWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1 data
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [openingBalanceAccounting, setOpeningBalanceAccounting] = useState(0);
    const [openingBalanceBank, setOpeningBalanceBank] = useState(0);
    const [accountingMovements, setAccountingMovements] = useState<AccountingMovement[]>([]);
    const [bankMovements, setBankMovements] = useState<BankMovement[]>([]);

    // Step 2 data
    const [matchedMovements, setMatchedMovements] = useState<MatchedMovement[]>([]);

    const canProceedStep1 = Boolean(
        selectedAccount &&
        startDate &&
        endDate &&
        accountingMovements.length > 0 &&
        bankMovements.length > 0
    );

    const canProceedStep2 = true; // Can always proceed from step 2 (even with unmatched items)

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = (reconciliation: BankReconciliation) => {
        onComplete(reconciliation);
        onOpenChange(false);
        // Reset wizard
        setCurrentStep(1);
        setSelectedAccount(null);
        setStartDate('');
        setEndDate('');
        setAccountingMovements([]);
        setBankMovements([]);
        setMatchedMovements([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Nueva Conciliación Bancaria</DialogTitle>
                </DialogHeader>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 py-4 border-b">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${step === currentStep
                                        ? 'bg-primary text-white'
                                        : step < currentStep
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step < currentStep ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    step
                                )}
                            </div>
                            {step < 3 && (
                                <div
                                    className={`w-20 h-1 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Labels */}
                <div className="flex items-center justify-between text-sm px-4">
                    <div className={`flex-1 text-center ${currentStep === 1 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                        ① Configuración
                    </div>
                    <div className={`flex-1 text-center ${currentStep === 2 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                        ② Matching
                    </div>
                    <div className={`flex-1 text-center ${currentStep === 3 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                        ③ Reporte
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {currentStep === 1 && (
                        <ReconciliationStep1Config
                            selectedAccount={selectedAccount}
                            setSelectedAccount={setSelectedAccount}
                            startDate={startDate}
                            setStartDate={setStartDate}
                            endDate={endDate}
                            setEndDate={setEndDate}
                            openingBalanceAccounting={openingBalanceAccounting}
                            setOpeningBalanceAccounting={setOpeningBalanceAccounting}
                            openingBalanceBank={openingBalanceBank}
                            setOpeningBalanceBank={setOpeningBalanceBank}
                            accountingMovements={accountingMovements}
                            setAccountingMovements={setAccountingMovements}
                            bankMovements={bankMovements}
                            setBankMovements={setBankMovements}
                        />
                    )}

                    {currentStep === 2 && (
                        <ReconciliationStep2Matching
                            accountingMovements={accountingMovements}
                            setAccountingMovements={setAccountingMovements}
                            bankMovements={bankMovements}
                            setBankMovements={setBankMovements}
                            matchedMovements={matchedMovements}
                            setMatchedMovements={setMatchedMovements}
                        />
                    )}

                    {currentStep === 3 && selectedAccount && (
                        <ReconciliationStep3Report
                            bankAccount={selectedAccount}
                            period={{ startDate: new Date(startDate), endDate: new Date(endDate) }}
                            openingBalanceAccounting={openingBalanceAccounting}
                            openingBalanceBank={openingBalanceBank}
                            accountingMovements={accountingMovements}
                            bankMovements={bankMovements}
                            matchedMovements={matchedMovements}
                            onComplete={handleComplete}
                        />
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between px-6 py-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Anterior
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        Paso {currentStep} de 3
                    </div>

                    {currentStep < 3 ? (
                        <Button
                            onClick={handleNext}
                            disabled={currentStep === 1 && !canProceedStep1}
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <div className="w-24" /> // Spacer - Complete button is in Step 3
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
