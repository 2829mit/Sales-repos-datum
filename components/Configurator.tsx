
import React, { useState, useRef, useEffect } from 'react';
import type { AccessoryOption, IotOption, TankOption, DispensingUnitOption, SafetyUpgradeOption, CustomerDetails, LicenseOption } from '../types';
import { 
  CONSUMPTION_OPTIONS, 
  TANK_OPTIONS, 
  REPOS_OS_OPTIONS, 
  DISPENSING_UNIT_OPTIONS, 
  MECHANICAL_INCLUSION_OPTIONS, 
  SAFETY_UPGRADE_OPTIONS, 
  LICENSE_OPTIONS, 
  SAFETY_UNIT_OPTIONS,
  RFD_Z_BASE_OPTIONS, RFD_Z_UPGRADE_OPTIONS,
  
  
  
  
  
  RFD_SENSORS_AND_CONTROLLER_OPTIONS,
  RFD_REPOS_OS_OPTIONS
} from '../constants';
import { getSafetyImage } from '../utils/vehicleHelpers';

interface ConfiguratorProps {
  customerDetails: CustomerDetails | null;
  paymentMode: 'outright' | 'installments';
  setPaymentMode: (mode: 'outright' | 'installments') => void;
  selectedTank: TankOption['id'];
  setSelectedTank: (tankId: TankOption['id']) => void;
  selectedReposOsOptions: AccessoryOption[];
  onReposOsToggle: (option: AccessoryOption) => void;
  selectedMechanicalInclusionOptions: AccessoryOption[];
  onMechanicalInclusionToggle: (option: AccessoryOption) => void;
  
  // Updated to Array for Multi-Select
  selectedDecantation: IotOption[];
  onDecantationToggle: (option: IotOption) => void;
  
  // Updated to Array for Multi-Select
  selectedDispensingUnits: DispensingUnitOption[];
  onDispensingUnitToggle: (option: DispensingUnitOption) => void;
  
  selectedSafetyUnits: AccessoryOption[];
  onSafetyUnitToggle: (option: AccessoryOption) => void;
  selectedSafetyUpgrades: SafetyUpgradeOption[];
  onSafetyUpgradeToggle: (option: SafetyUpgradeOption) => void;

  rfidTagsQuantity: number;
  setRfidTagsQuantity: (qty: number) => void;

  selectedLicenseOptions: LicenseOption[];
  selectedConsumption: string | null;
  onConsumptionSelect: (consumption: string) => void;
  
  totalContractValue: number; 
  gstAmount: number;
  finalPrice: number; 
  
  recommendedTankId: TankOption['id'] | null;
  showPrices: boolean;
  onResetConfiguration?: () => void;
  
  // Handlers for opening modals
  onOpenComparison: () => void;
  onOpenQuote: () => void;
  onCalculateRoi: () => void;

  // Custom Product Props
  selectedProduct: 'rfd-portable' | 'rfd-z';
  setSelectedProduct: (prod: 'rfd-portable' | 'rfd-z') => void;

  // RFD Z state
  rfdZBase: string;
  setRfdZBase: (val: string) => void;
  rfdZUpgrades: string[];
  onRfdZUpgradeToggle: (val: string) => void;

}

const ChevronUp: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDown: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Configurator: React.FC<ConfiguratorProps> = ({
  customerDetails,
  paymentMode,
  setPaymentMode,
  selectedTank,
  setSelectedTank,
  selectedReposOsOptions,
  onReposOsToggle,
  selectedMechanicalInclusionOptions,
  onMechanicalInclusionToggle,
  selectedDecantation,
  onDecantationToggle,
  selectedDispensingUnits,
  onDispensingUnitToggle,
  selectedSafetyUnits,
  onSafetyUnitToggle,
  selectedSafetyUpgrades,
  onSafetyUpgradeToggle,
  rfidTagsQuantity,
  setRfidTagsQuantity,
  selectedConsumption,
  onConsumptionSelect,
  
  totalContractValue,
  gstAmount,
  finalPrice,
  
  recommendedTankId,
  showPrices,
  onResetConfiguration,
  
  onOpenComparison,
  onOpenQuote,
  onCalculateRoi,

  // Custom Product Props
  selectedProduct,
  setSelectedProduct,

  // RFD Z state
  rfdZBase,
  setRfdZBase,
  rfdZUpgrades,
  onRfdZUpgradeToggle,

}) => {
  const [learnMoreOption, setLearnMoreOption] = useState<SafetyUpgradeOption | IotOption | AccessoryOption | null>(null);

  const [isStickyFooterVisible, setIsStickyFooterVisible] = useState(true);
  const [isPricingDetailsOpen, setIsPricingDetailsOpen] = useState(true);
  const [showIncludedOptions, setShowIncludedOptions] = useState(false);
  
  const pricingSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPrices) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStickyFooterVisible(!entry.isIntersecting);
      },
      { root: null, threshold: 0.1, rootMargin: "0px" }
    );

    const currentRef = pricingSectionRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.disconnect();
    };
  }, [showPrices]);

  const formatCurrency = (amount: number) => {
    if (!showPrices) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPrice = (monthlyPrice: number) => {
    if (!showPrices) return '';
    if (paymentMode === 'outright') {
        const fullPrice = monthlyPrice * 36;
        return fullPrice === 0 ? formatCurrency(0) : `+${formatCurrency(fullPrice)}`;
    }
    return monthlyPrice === 0 ? formatCurrency(0) : `+${formatCurrency(monthlyPrice)}`;
  };
  
  const currentTank = TANK_OPTIONS.find(t => t.id === selectedTank);

  const tankBasePrice = currentTank ? currentTank.price : 0;

  // DETERMINE MULTIPLIER BASED ON PAYMENT MODE
  const multiplier = paymentMode === 'outright' ? 36 : 1;

  let pricingItems: { name: string; price: number }[] = [];

  if (selectedProduct === 'rfd-z') {
    const baseOpt = RFD_Z_BASE_OPTIONS.find(c => c.id === rfdZBase);
    const basePrice = (baseOpt ? baseOpt.price : 0) * multiplier;
    const baseName = baseOpt ? baseOpt.name : 'Datum 2KL';

    pricingItems = [
      { name: baseName, price: basePrice },
      ...rfdZUpgrades.map(id => {
        const opt = RFD_Z_UPGRADE_OPTIONS.find(o => o.id === id);
        return { name: opt ? opt.name : id, price: (opt ? opt.price : 0) * multiplier };
      })
    ];
  } else {
    pricingItems = [
      { name: `RPS Base Price (${currentTank?.name || ''} Tank)`, price: tankBasePrice * multiplier },
      ...selectedDispensingUnits.map(du => ({ name: du.name, price: du.price * multiplier })),
      ...selectedReposOsOptions.map(opt => ({ name: opt.name, price: opt.price * multiplier })),
      ...selectedDecantation.map(opt => ({ name: opt.name, price: opt.price * multiplier })),
      ...selectedMechanicalInclusionOptions.map(opt => ({ name: opt.name, price: opt.price * multiplier })),
      ...selectedSafetyUnits.map(opt => ({ name: opt.name, price: opt.price * multiplier })),
      ...selectedSafetyUpgrades
        .filter(opt => !(selectedTank === '30kl' && opt.id === 'advanced-skid'))
        .map(opt => ({ name: opt.name, price: opt.price * multiplier })),
    ];

    if (rfidTagsQuantity > 0) {
      pricingItems.push({
        name: `RFID Tags (${rfidTagsQuantity} nos)`,
        price: (rfidTagsQuantity * 49) * multiplier
      });
    }

    // Hide Tank Base Price row from the list if desired
    pricingItems = pricingItems.filter(item => !item.name.includes('RPS Base Price'));
  }

  const paidItems = pricingItems.filter(item => item.price > 0);
  const includedItems = pricingItems.filter(item => item.price === 0);

  const displayedPriceLabel = paymentMode === 'outright' 
    ? (selectedProduct === 'rfd-z' ? 'Total RFD Z Price (Inc. GST)' : 'Total RPS Price (Inc. GST)') 
    : 'Monthly Payment (36 mo)';
  const footerPrice = finalPrice;
  
  const subtotalDisplay = paymentMode === 'outright' ? totalContractValue : finalPrice;
  const subtotalLabel = paymentMode === 'outright' ? 'Subtotal (Excl. GST)' : 'Total Monthly Payment';

  return (
    <div className="bg-white text-gray-800 lg:h-full h-auto flex flex-col relative lg:overflow-hidden">
      <div className="flex-grow lg:overflow-y-auto overflow-visible scroll-smooth pb-24">
        <div className="pb-6 md:pb-10">
          
          {/* Sticky Header Section with Clear Button */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 md:px-10 mb-6 flex justify-between items-center shadow-sm">
             <h1 className="text-xl md:text-2xl font-medium text-[#171A20]">Repos Fuel Datum</h1>
             {onResetConfiguration && (
               <button 
                 onClick={onResetConfiguration}
                 className="flex-shrink-0 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors uppercase tracking-wide shadow-sm"
               >
                 Clear All
               </button>
             )}
          </div>

          <div className="px-6 md:px-10">
            {/* Product Selector */}
            <div className="mb-8 border-b border-gray-100 pb-6 mt-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Select Product Variant</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl shadow-inner">
                {[
                  { id: 'rfd-portable', label: 'RFD Portable' },
                  { id: 'rfd-z', label: 'RFD Z' },
                ].map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod.id as any)}
                    className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all duration-300 text-center uppercase tracking-wider ${
                      selectedProduct === prod.id
                        ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'
                    }`}
                  >
                    {prod.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-around my-8 text-center">
              {[
                { label: 'Speed', value: selectedProduct === 'rfd-portable' ? '120L/m' : selectedProduct === 'rfd-z' ? '50L/m' : '150L/m' },
                { label: 'Tracking', value: '100%' },
                { label: 'Monitoring', value: '24/7' },
              ].map(spec => (
                <div key={spec.label}>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">{spec.value}</p>
                  <p className="text-xs sm:text-[14px] leading-[20px] text-[#393C41] mt-1">{spec.label}</p>
                </div>
              ))}
            </div>

            {/* RFD Z Configuration Panel */}
            {selectedProduct === 'rfd-z' && (
              <div className="animate-fade-in space-y-8">
                {/* Base Options */}
                <div className="mb-[45px]">
                  <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Select Base Option</h2>
                  <div className="space-y-4">
                    {RFD_Z_BASE_OPTIONS.map(option => (
                      <button 
                        key={option.id}
                        onClick={() => setRfdZBase(option.id)}
                        className={`group relative w-full p-4 border rounded-lg text-left transition-all duration-300 ${
                          rfdZBase === option.id 
                            ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50' 
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option.name}</p>
                          </div>
                          <span className="font-medium text-[14px] text-gray-500">
                            {showPrices ? formatPrice(option.price) : ''}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upgrades */}
                <div className="mb-[45px]">
                  <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Add-Ons</h2>
                  <div className="space-y-2">
                    {RFD_Z_UPGRADE_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        onClick={() => onRfdZUpgradeToggle(option.id)}
                        className={`group w-full flex items-center p-4 border rounded-lg text-left cursor-pointer transition-all duration-300 ${
                          rfdZUpgrades.includes(option.id) ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className={`h-5 w-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors mr-3 ${
                          rfdZUpgrades.includes(option.id) ? 'bg-gray-600 border-gray-600' : 'bg-white border-gray-300'
                        }`}>
                          {rfdZUpgrades.includes(option.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-grow flex justify-between items-center relative">
                          <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option.name}</p>
                          <span className="font-medium text-[14px] leading-[20px] text-[#171A20] pr-8">
                            {showPrices ? (option.displayPrice ? option.displayPrice : formatPrice(option.price)) : ''}
                          </span>
                          {option.description && (
                            <div role="button" onClick={(e) => { e.stopPropagation(); setLearnMoreOption(option as any); }} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-black hover:bg-black/10 rounded-full p-1" title="View Details">
                              <InfoIcon />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">* 18% GST will be added to the amount after selection</p>
                </div>
              </div>
            )}

            {selectedProduct === 'rfd-portable' && (
              <>
                {/* 1. Consumption */}
            <div className="mb-[45px]">
              <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Consumption</h2>
              <div className="space-y-4">
                {CONSUMPTION_OPTIONS.map(option => (
                  <button 
                      key={option}
                      onClick={() => onConsumptionSelect(option)}
                      className={`group relative w-full p-4 border rounded-lg text-left transition-all duration-300 ${
                        selectedConsumption === option 
                          ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50' 
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                  >
                      <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">Consumption</p>
                            <p className="font-medium text-[12px] leading-[18px] text-[#5C5E62]">Monthly</p>
                          </div>
                          <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option}</p>
                      </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. RPS Capacity */}
            <div className="mb-[45px]">
              <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">RPS Capacity</h2>
              <div className="space-y-4">
                {TANK_OPTIONS.map(option => (
                    <button 
                        key={option.id}
                        onClick={() => setSelectedTank(option.id)}
                        className={`group relative w-full p-4 border rounded-lg text-left transition-all duration-300 ${
                          selectedTank === option.id 
                            ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50' 
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                    >
                        {recommendedTankId === option.id && (
                            <div className="absolute top-0 right-0 text-white text-xs font-semibold z-10">
                                <div className="relative bg-blue-600 px-2.5 py-0.5 rounded-tr-lg shadow">Recommended</div>
                                <div className="absolute top-full left-0 w-0 h-0" style={{ borderStyle: 'solid', borderWidth: '0 6px 6px 0', borderColor: 'transparent #1d4ed8 transparent transparent' }} />
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option.name}</p>
                              {option.dimensions && <p className="font-medium text-[12px] leading-[18px] text-[#5C5E62]">{option.dimensions}</p>}
                            </div>
                        </div>
                        {selectedTank && selectedTank !== option.id && (
                            <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg transition-opacity duration-300 group-hover:opacity-0"></div>
                        )}
                    </button>
                ))}
              </div>
            </div>

            {/* Compare Features Button */}
            <div className="mb-[45px]">
                <button
                    onClick={onOpenComparison}
                    className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors"
                >
                    <span className="font-semibold text-gray-800">View & Compare Features</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* 4. Mechanical Inclusions */}
            <div className="mb-[45px]">
              <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Mechanical Inclusions</h2>
              <div className="space-y-2">
                {MECHANICAL_INCLUSION_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    onClick={() => onMechanicalInclusionToggle(option)}
                    className={`group w-full flex items-center p-4 border rounded-lg text-left cursor-pointer transition-all duration-300 ${
                      selectedMechanicalInclusionOptions.some(o => o.id === option.id) ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className={`h-5 w-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors mr-3 ${
                      selectedMechanicalInclusionOptions.some(o => o.id === option.id) ? 'bg-gray-600 border-gray-600' : 'bg-white border-gray-300'
                    }`}>
                      {selectedMechanicalInclusionOptions.some(o => o.id === option.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-grow flex justify-between items-center">
                      <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option.name}</p>
                      <div className="relative min-w-[60px] flex justify-end">
                         <span className={`font-medium text-[14px] leading-[20px] text-[#171A20] transition-opacity duration-200 ${option.infoImageUrl ? 'group-hover:opacity-0' : ''}`}>
                             {showPrices ? formatPrice(option.price) : ''}
                         </span>
                         {option.infoImageUrl && (
                           <div role="button" onClick={(e) => { e.stopPropagation(); setLearnMoreOption(option); }} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-black hover:bg-black/10 rounded-full p-1" title="View Image">
                             <InfoIcon />
                           </div>
                         )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Dispensing Module */}
            <div className="mb-[45px]">
              <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Dispensing Module</h2>
              <div className="space-y-2">
                {DISPENSING_UNIT_OPTIONS.map(option => (
                  <button
                    key={`dispensing-unit-${option.id}`}
                    onClick={() => onDispensingUnitToggle(option)}
                    className={`group relative w-full flex items-center p-4 border rounded-lg text-left cursor-pointer transition-all duration-300 ${
                      selectedDispensingUnits.some(du => du.id === option.id)
                        ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className={`h-5 w-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors mr-3 ${
                      selectedDispensingUnits.some(du => du.id === option.id) ? 'bg-gray-600 border-gray-600' : 'bg-white border-gray-300'
                    }`}>
                      {selectedDispensingUnits.some(du => du.id === option.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option.name}</p>
                          {option.subtext && <p className="font-medium text-[12px] leading-[18px] text-[#5C5E62]">{option.subtext}</p>}
                        </div>
                        <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">
                          {showPrices ? formatPrice(option.price) : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Sensors and Controller Unit */}
            <div className="mb-[45px]">
                <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Sensors and Controller Unit</h2>
                <div className="space-y-2">
                  {SAFETY_UNIT_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => onSafetyUnitToggle(option)}
                      className={`group w-full flex items-center p-4 border rounded-lg text-left cursor-pointer transition-all duration-300 ${
                        selectedSafetyUnits.some(o => o.id === option.id) ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className={`h-5 w-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors mr-3 ${
                        selectedSafetyUnits.some(o => o.id === option.id) ? 'bg-gray-600 border-gray-600' : 'bg-white border-gray-300'
                      }`}>
                        {selectedSafetyUnits.some(o => o.id === option.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-grow flex justify-between items-center">
                        <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option.name}</p>
                        <div className="relative min-w-[60px] flex justify-end">
                            <span className={`font-medium text-[14px] leading-[20px] text-[#171A20] transition-opacity duration-200 ${option.infoImageUrl ? 'group-hover:opacity-0' : ''}`}>
                                {showPrices ? formatPrice(option.price) : ''}
                            </span>
                            {option.infoImageUrl && (
                              <div role="button" onClick={(e) => { e.stopPropagation(); setLearnMoreOption(option); }} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-black hover:bg-black/10 rounded-full p-1" title="View Image">
                                <InfoIcon />
                              </div>
                            )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
            </div>

            {/* 7. Add-Ons */}
            <div className="mb-[45px]">
                <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Add-Ons</h2>
                <div className="space-y-6">
                  {/* RFID Tags Numeric Option */}
                  <div className={`group w-full p-4 border border-gray-300 rounded-lg transition-all duration-300 bg-white hover:border-gray-400`}>
                    <div className="flex justify-between items-center">
                       <span className="font-medium text-[14px] leading-[20px] text-[#171A20]">RFID Tags</span>
                       <div className="flex items-center gap-4">
                          <span className="font-medium text-[14px] leading-[20px] text-[#171A20]">{showPrices ? formatPrice(rfidTagsQuantity * 49) : ''}</span>
                          <div className="flex items-center border border-gray-200 rounded-md bg-gray-50 overflow-hidden">
                             <button 
                               onClick={() => setRfidTagsQuantity(Math.max(0, rfidTagsQuantity - 1))}
                               className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 font-bold border-r border-gray-200"
                             >
                               -
                             </button>
                             <input 
                               type="number" 
                               min="0"
                               value={rfidTagsQuantity}
                               onChange={(e) => setRfidTagsQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                               className="w-12 text-center bg-transparent text-sm font-semibold outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                             />
                             <button 
                               onClick={() => setRfidTagsQuantity(rfidTagsQuantity + 1)}
                               className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 font-bold border-l border-gray-200"
                             >
                               +
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>

                  {SAFETY_UPGRADE_OPTIONS.filter(opt => !(selectedTank === '30kl' && opt.id === 'advanced-skid')).map(option => {
                    const isListItemStyle = ['advanced-skid', 'backup-du', 'sampling-kit'].includes(option.id);
                    if (isListItemStyle) {
                      return (
                        <button
                          key={option.id}
                          onClick={() => onSafetyUpgradeToggle(option)}
                          className={`group w-full flex items-center p-4 border rounded-lg text-left cursor-pointer transition-all duration-300 ${
                            selectedSafetyUpgrades.some(o => o.id === option.id) ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className={`h-5 w-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors mr-3 ${
                            selectedSafetyUpgrades.some(o => o.id === option.id) ? 'bg-gray-600 border-gray-600' : 'bg-white border-gray-300'
                          }`}>
                            {selectedSafetyUpgrades.some(o => o.id === option.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-grow flex justify-between items-center">
                            <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option.name}</p>
                            <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">
                              {showPrices ? formatPrice(option.price) : ''}
                            </p>
                          </div>
                        </button>
                      );
                    }
                    return (
                      <div key={option.id} className="flex flex-col">
                        <div onClick={() => onSafetyUpgradeToggle(option)} className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${selectedSafetyUpgrades.some(o => o.id === option.id) ? 'border-gray-400 ring-1 ring-gray-400' : 'border-gray-300 hover:border-gray-400'}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-5 w-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${selectedSafetyUpgrades.some(o => o.id === option.id) ? 'bg-gray-600 border-gray-600' : 'bg-white border-gray-300'}`}>
                                {selectedSafetyUpgrades.some(o => o.id === option.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className="font-medium text-gray-900">{option.name}</span>
                            </div>
                            <span className="font-medium text-gray-900">{showPrices ? formatPrice(option.price) : ''}</span>
                          </div>
                          <div className="w-full bg-white rounded-lg flex items-center justify-center overflow-hidden">
                            <img src={option.imageUrl || getSafetyImage(selectedTank, option.id)} alt={option.name} className="max-h-[150px] w-auto object-contain mix-blend-multiply" />
                          </div>
                        </div>
                        <div className="flex justify-center mt-3">
                          <button onClick={(e) => { e.stopPropagation(); setLearnMoreOption(option); }} className="bg-gray-100 text-gray-800 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">Learn More</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>

            {/* 8. Repos OS */}
            <div className="mb-[45px]">
              <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Repos OS</h2>
              <div className="space-y-2">
                {REPOS_OS_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    onClick={() => onReposOsToggle(option)}
                    className={`w-full flex items-center p-4 border rounded-lg text-left cursor-pointer transition-all duration-300 ${
                      selectedReposOsOptions.some(o => o.id === option.id) ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className={`h-5 w-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors mr-3 ${selectedReposOsOptions.some(o => o.id === option.id) ? 'bg-gray-600 border-gray-600' : 'bg-white border-gray-300'}`}>
                      {selectedReposOsOptions.some(o => o.id === option.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="flex-grow flex justify-between items-center">
                      <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option.name}</p>
                      <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{showPrices ? formatPrice(option.price) : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 9. Licenses and Compliances */}
            <div className="mb-[45px]">
              <h2 className="text-2xl font-semibold text-center text-gray-900 mt-8">Licenses and Compliance</h2>
              <div className="space-y-3 mt-6">
                {LICENSE_OPTIONS.map(option => (
                  <div key={`license-${option.id}`} className="w-full flex items-center p-4 border border-gray-300 rounded-lg text-left bg-gray-50">
                    <div className="flex-grow flex justify-between items-center">
                      <span className="font-medium text-gray-900">{option.name}</span>
                      {option.subtext && <span className="text-sm text-gray-500 font-medium">{option.subtext}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </>
            )}

            {/* Pricing Breakdown */}
            {showPrices ? (
              <div ref={pricingSectionRef} className="pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6 cursor-pointer group select-none" onClick={() => setIsPricingDetailsOpen(!isPricingDetailsOpen)}>
                  <h2 className="text-xl font-medium text-gray-900">Pricing Details</h2>
                  <div className="flex items-center gap-4">
                      {selectedProduct !== 'rfd-z' && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className={`${paymentMode === 'installments' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Monthly</span>
                            <button onClick={(e) => { e.stopPropagation(); setPaymentMode(paymentMode === 'installments' ? 'outright' : 'installments'); }} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${paymentMode === 'outright' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${paymentMode === 'outright' ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                            <span className={`${paymentMode === 'outright' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Full Price</span>
                        </div>
                      )}

                      <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors">{isPricingDetailsOpen ? <ChevronUp /> : <ChevronDown />}</div>
                  </div>
                </div>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isPricingDetailsOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-3 text-sm text-gray-600 mb-8">
                      {paidItems.map((item, idx) => (
                        <div key={`paid-${idx}`} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 my-3 pt-3">
                          <div className="flex justify-between font-semibold text-gray-800">
                              <span>{subtotalLabel}</span>
                              <span>{formatCurrency(subtotalDisplay)}</span>
                          </div>
                          {paymentMode === 'outright' && (
                            <div className="flex justify-between text-gray-600 mt-1">
                                <span>GST (18%)</span>
                                <span>{formatCurrency(gstAmount)}</span>
                            </div>
                          )}
                          {paymentMode === 'installments' && (
                             <>
                               <div className="flex justify-between text-blue-600 font-medium mt-2 text-sm">
                                  <span>Down Payment (GST Amount)</span>
                                  <span>{formatCurrency(gstAmount)}</span>
                               </div>
                               <div className="flex justify-between text-gray-600 mt-1 text-sm">
                                  <span>Tenure</span>
                                  <span>36 Months</span>
                               </div>
                               <div className="mt-2 text-xs text-gray-500 italic text-right">Subject to approval from Partnered Bank</div>
                             </>
                          )}
                      </div>
                      {includedItems.length > 0 && (
                        <div className="mt-4 border-t border-gray-100 pt-2">
                           <button onClick={() => setShowIncludedOptions(!showIncludedOptions)} className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-800 mb-2">
                             {showIncludedOptions ? 'Hide included features' : 'Show included features'}
                             <span className="ml-1">{showIncludedOptions ? <ChevronUp /> : <ChevronDown />}</span>
                           </button>
                           <div className={`space-y-2 pl-2 transition-all duration-300 overflow-hidden ${showIncludedOptions ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                             {includedItems.map((item, idx) => (
                               <div key={`inc-${idx}`} className="flex justify-between text-gray-500">
                                 <span>{item.name}</span>
                                 <span>Included</span>
                               </div>
                             ))}
                           </div>
                        </div>
                      )}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-8">
                     <span className="text-lg font-semibold text-gray-900">{displayedPriceLabel}</span>
                     <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(finalPrice)}</span>
                        {paymentMode === 'outright' && <p className="text-xs text-gray-500 font-normal">Inclusive of GST</p>}
                     </div>
                </div>
                <div className="flex gap-4 flex-col sm:flex-row">
                     <button 
                       onClick={onCalculateRoi} 
                       className="flex-1 py-3 px-4 rounded text-sm font-semibold transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200"
                     >
                       Calculate ROI
                     </button>
                     <button onClick={onOpenQuote} className="flex-1 py-3 px-4 rounded text-sm font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700">View Quote</button>
                </div>
              </div>
            ) : (
              <div className="pt-8 border-t border-gray-200 mb-8">
                  <div className="flex gap-4 flex-col sm:flex-row">
                     <button className="w-full py-3 px-4 rounded text-sm font-semibold bg-blue-600 text-white transition-colors hover:bg-blue-700" onClick={onCalculateRoi}>Calculate ROI</button>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showPrices && (
        <div className={`fixed bottom-0 left-0 right-0 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 p-4 z-20 w-full pointer-events-none transition-transform duration-300 ease-in-out ${isStickyFooterVisible ? 'translate-y-0' : 'translate-y-[120%]'}`}>
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-4 pointer-events-auto">
             <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(footerPrice)}</p>
                  {paymentMode === 'installments' && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Per Month</p>}
                </div>
                <button onClick={onOpenQuote} className="bg-blue-600 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-md text-sm sm:text-base font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">View Quote</button>
             </div>
          </div>
        </div>
      )}
      {learnMoreOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setLearnMoreOption(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLearnMoreOption(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 text-center">{learnMoreOption.name}</h3>
            {((learnMoreOption as any).infoImageUrl || (learnMoreOption as any).imageUrl || ((learnMoreOption as any).id?.includes('fire')) || ((learnMoreOption as any).id?.includes('crash'))) ? (
               <div className="flex justify-center mb-6"><img src={(learnMoreOption as any).infoImageUrl || ((learnMoreOption as SafetyUpgradeOption).id.includes('fire') || (learnMoreOption as SafetyUpgradeOption).id.includes('crash') ? getSafetyImage(selectedTank, (learnMoreOption as SafetyUpgradeOption).id) : (learnMoreOption as any).imageUrl)} alt={learnMoreOption.name} className="max-h-64 object-contain" /></div>
            ) : null}
            <p className="text-gray-600 text-center leading-relaxed">{(learnMoreOption as any).description || 'No description available.'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configurator;
