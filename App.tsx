
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import CarVisualizer from './components/CarVisualizer';
import Configurator from './components/Configurator';
import LeadFormModal from './components/LeadFormModal';
import LoginModal from './components/LoginModal';
import LandingPage from './components/LandingPage';
import ExplorePage from './components/ExplorePage';
import FaqPage from './components/FaqPage';
import ReposPayPage from './components/ReposPayPage';
import AboutUsPage from './components/AboutUsPage';
import ComparisonModal from './components/ComparisonModal';
import { generateQuotePDF } from './utils/pdfGenerator';
import { logQuoteGeneration } from './services/api';
import type { AccessoryOption, IotOption, TankOption, DispensingUnitOption, SafetyUpgradeOption, CustomerDetails, LicenseOption, QuoteData } from './types';
import { 
  TANK_OPTIONS,
  RFD_Z_BASE_OPTIONS, RFD_Z_UPGRADE_OPTIONS,
  
  
  
  
  
  RFD_SENSORS_AND_CONTROLLER_OPTIONS,
  RFD_REPOS_OS_OPTIONS
} from './constants';
import { getRecommendedTankId } from './utils/vehicleHelpers';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'explore' | 'faq' | 'reposPay' | 'about'>('landing');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [userRole, setUserRole] = useState<'sales' | 'guest' | null>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [showRoiCalculator, setShowRoiCalculator] = useState(false);
  
  // Modal States
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  
  // Track if we are waiting for lead form submission to generate a quote
  const [pendingQuoteGeneration, setPendingQuoteGeneration] = useState(false);

  // Discount Feature State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [paymentMode, setPaymentMode] = useState<'outright' | 'installments'>('installments');
  
  // Selected Tank - Base product remains selected
  const [selectedTank, setSelectedTank] = useState<TankOption['id']>(() => 
    TANK_OPTIONS[0]?.id || '22kl'
  );
  
  // Selection States
  const [selectedReposOsOptions, setSelectedReposOsOptions] = useState<AccessoryOption[]>([]);
  const [selectedMechanicalInclusionOptions, setSelectedMechanicalInclusionOptions] = useState<AccessoryOption[]>([]);
  const [selectedDecantation, setSelectedDecantation] = useState<IotOption[]>([]);
  const [selectedDispensingUnits, setSelectedDispensingUnits] = useState<DispensingUnitOption[]>([]);
  const [selectedSafetyUnits, setSelectedSafetyUnits] = useState<AccessoryOption[]>([]);
  const [selectedSafetyUpgrades, setSelectedSafetyUpgrades] = useState<SafetyUpgradeOption[]>([]);
  const [selectedLicenseOptions, setSelectedLicenseOptions] = useState<LicenseOption[]>([]);
  const [rfidTagsQuantity, setRfidTagsQuantity] = useState<number>(0);

  const [selectedConsumption, setSelectedConsumption] = useState<string | null>(null);
  const [recommendedTankId, setRecommendedTankId] = useState<TankOption['id'] | null>(null);

  // Product Variant state
  const [selectedProduct, setSelectedProduct] = useState<'rfd-portable' | 'rfd-z'>('rfd-portable');

  // RFD Z state
  const [rfdZBase, setRfdZBase] = useState<string>('datum-2kl');
  const [rfdZUpgrades, setRfdZUpgrades] = useState<string[]>([]);

  const handleRfdZUpgradeToggle = (val: string) => {
    setRfdZUpgrades(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  useEffect(() => {
    if (selectedProduct === 'rfd-z') {
      setPaymentMode('outright');
    }
  }, [selectedProduct]);

  // Compute if we should show the capacity platform preview
  const showCapacityPreview = useMemo(() => {
    const addOnCount = 
      selectedReposOsOptions.length + 
      selectedMechanicalInclusionOptions.length + 
      selectedDecantation.length + 
      selectedDispensingUnits.length + 
      selectedSafetyUnits.length + 
      selectedSafetyUpgrades.length +
      (rfidTagsQuantity > 0 ? 1 : 0);
    
    return addOnCount === 0;
  }, [
    selectedReposOsOptions, 
    selectedMechanicalInclusionOptions, 
    selectedDecantation, 
    selectedDispensingUnits, 
    selectedSafetyUnits, 
    selectedSafetyUpgrades,
    rfidTagsQuantity
  ]);

  useEffect(() => {
    const s3BaseUrl = 'https://drf-media-data.s3.ap-south-1.amazonaws.com/compressor_aws/ShortPixelOptimized/';
    const imageCount = 31;
    const imageUrls = Array.from({ length: imageCount }, (_, i) => `${s3BaseUrl}${i + 1}.png`);
    
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  const handleLogin = (role: 'sales' | 'guest', userId?: string) => {
    setUserRole(role);
    if (userId) setLoggedInUserId(userId);
    setIsLoginModalOpen(false);
    setIsLeadFormOpen(true);
  };

  const handleConsumptionSelect = (consumption: string) => {
    setSelectedConsumption(consumption);
    const recId = getRecommendedTankId(consumption);
    setRecommendedTankId(recId);
  };
  
  const handleTankChange = (tankId: TankOption['id']) => {
    setSelectedTank(tankId);
    if (tankId === '30kl') {
      setSelectedSafetyUpgrades(prev => prev.filter(opt => opt.id !== 'advanced-skid'));
    }
  };

  const handleReposOsToggle = (option: AccessoryOption) => {
    setSelectedReposOsOptions(prev =>
      prev.find(o => o.id === option.id)
        ? prev.filter(o => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleMechanicalInclusionToggle = (option: AccessoryOption) => {
    setSelectedMechanicalInclusionOptions(prev =>
      prev.find(o => o.id === option.id)
        ? prev.filter(o => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleDecantationToggle = (option: IotOption) => {
    setSelectedDecantation(prev =>
      prev.find(o => o.id === option.id)
        ? prev.filter(o => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleSafetyUnitToggle = (option: AccessoryOption) => {
    setSelectedSafetyUnits(prev =>
      prev.find(o => o.id === option.id)
        ? prev.filter(o => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleSafetyUpgradeToggle = (option: SafetyUpgradeOption) => {
    setSelectedSafetyUpgrades(prev => {
      const exists = prev.find(o => o.id === option.id);
      if (!exists) {
        return [...prev, option];
      }
      return prev.filter(o => o.id !== option.id);
    });
  };

  const handleDispensingUnitToggle = (option: DispensingUnitOption) => {
    setSelectedDispensingUnits(prev => 
      prev.find(o => o.id === option.id)
        ? prev.filter(o => o.id !== option.id)
        : [...prev, option]
    );
  };

  const resetConfiguration = () => {
    setSelectedTank(TANK_OPTIONS[0]?.id || '22kl');
    setSelectedReposOsOptions([]);
    setSelectedMechanicalInclusionOptions([]);
    setSelectedDecantation([]);
    setSelectedDispensingUnits([]);
    setSelectedSafetyUnits([]);
    setSelectedSafetyUpgrades([]);
    setSelectedLicenseOptions([]);
    setRfidTagsQuantity(0);
    setPaymentMode('installments');
    setDiscountAmount(0);

    // RFD Z state
    setRfdZBase('datum-2kl');
    setRfdZUpgrades([]);
  };

  const monthlyTotalPrice = useMemo(() => {
    if (selectedProduct === 'rfd-z') {
      let price = 0;
      const baseOpt = RFD_Z_BASE_OPTIONS.find(c => c.id === rfdZBase);
      price += baseOpt ? baseOpt.price : 0;
      
      rfdZUpgrades.forEach(uId => {
        const opt = RFD_Z_UPGRADE_OPTIONS.find(x => x.id === uId);
        price += opt ? opt.price : 0;
      });

      return price;
    } else {
      const tank = TANK_OPTIONS.find(t => t.id === selectedTank);
      const tankPrice = tank ? tank.price : 0;

      let price = tankPrice;
      price += selectedDispensingUnits.reduce((sum, du) => sum + du.price, 0);
      price += selectedReposOsOptions.reduce((total, opt) => total + opt.price, 0);
      price += selectedMechanicalInclusionOptions.reduce((total, totalOpt) => total + totalOpt.price, 0);
      price += selectedDecantation.reduce((total, opt) => total + opt.price, 0);
      price += selectedSafetyUnits.reduce((total, unit) => total + unit.price, 0);
      price += selectedSafetyUpgrades.reduce((total, unit) => {
        if (selectedTank === '30kl' && unit.id === 'advanced-skid') {
          return total;
        }
        return total + unit.price;
      }, 0);
      price += selectedLicenseOptions.reduce((total, opt) => total + opt.price, 0);
      // Add RFID Tags cost: 49 per tag per month
      price += (rfidTagsQuantity * 49);
      return price;
    }
  }, [
    selectedProduct,
    selectedTank,
    selectedDispensingUnits,
    selectedReposOsOptions,
    selectedMechanicalInclusionOptions,
    selectedDecantation,
    selectedSafetyUnits,
    selectedSafetyUpgrades,
    selectedLicenseOptions,
    rfidTagsQuantity,
    rfdZBase,
    rfdZUpgrades
  ]);

  const totalContractValue = useMemo(() => {
    return monthlyTotalPrice * 36;
  }, [monthlyTotalPrice]);

  const gstAmount = useMemo(() => {
    return totalContractValue * 0.18;
  }, [totalContractValue]);

  const totalInclTax = useMemo(() => {
    return totalContractValue + gstAmount;
  }, [totalContractValue, gstAmount]);

  const displayPrice = useMemo(() => {
    if (paymentMode === 'outright') {
      return totalInclTax;
    }
    return monthlyTotalPrice;
  }, [totalInclTax, monthlyTotalPrice, paymentMode]);

  const showPrices = userRole === 'sales';

  const handleLeadFormClose = async (details?: CustomerDetails) => {
    setIsLeadFormOpen(false);
    
    if (details) {
      setCustomerDetails(details);
      setSelectedConsumption(details.consumption);
      
      const recId = getRecommendedTankId(details.consumption);
      setRecommendedTankId(recId);

      // Check if we need to generate a quote
      if (pendingQuoteGeneration) {
        const quoteData: QuoteData = {
          customerDetails: details,
          paymentMode,
          totalPrice: displayPrice,
          gstAmount: gstAmount,
          totalContractValue: totalContractValue,
          monthlyPrice: paymentMode === 'installments' ? displayPrice : undefined,
          rfidTagsQuantity,
          discountAmount,
          selectedProduct: selectedProduct,
          rfdZConfiguration: selectedProduct === 'rfd-z' ? {
            base: rfdZBase,
            upgrades: rfdZUpgrades,
          } : undefined,
          configuration: {
            tank: selectedTank,
            dispensingUnits: selectedDispensingUnits,
            decantation: selectedDecantation,
            accessories: {
              reposOs: selectedReposOsOptions,
              mechanical: selectedMechanicalInclusionOptions,
              safetyUnits: selectedSafetyUnits,
              safetyUpgrades: selectedSafetyUpgrades,
            },
            licenses: selectedLicenseOptions,
          }
        };

        await generateQuotePDF(quoteData);
        logQuoteGeneration(quoteData);
        setPendingQuoteGeneration(false);
      }
    } else {
      // User closed without submitting
      setPendingQuoteGeneration(false);
    }
  };

  const handleEnterApp = () => {
    setCurrentView('app');
    setShowRoiCalculator(false);
  };

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onEnterApp={handleEnterApp} 
        onExploreClick={() => setCurrentView('explore')}
        onFaqClick={() => setCurrentView('faq')}
        onReposPayClick={() => setCurrentView('reposPay')}
        onAboutClick={() => setCurrentView('about')}
        onRoiClick={() => {
          setCurrentView('app');
          setShowRoiCalculator(true);
        }}
      />
    );
  }

  if (currentView === 'explore') {
    return (
      <ExplorePage 
        onNavigateHome={() => setCurrentView('landing')}
        onNavigateToApp={handleEnterApp}
        onFaqClick={() => setCurrentView('faq')}
        onAboutClick={() => setCurrentView('about')}
      />
    );
  }

  if (currentView === 'faq') {
    return (
      <FaqPage 
        onBack={() => setCurrentView('landing')} 
        onAboutClick={() => setCurrentView('about')}
      />
    );
  }

  if (currentView === 'reposPay') {
    return (
      <ReposPayPage 
        onBack={() => setCurrentView('landing')}
        onNavigateToApp={handleEnterApp}
        onAboutClick={() => setCurrentView('about')}
      />
    );
  }

  if (currentView === 'about') {
    return (
      <AboutUsPage
        onNavigateHome={() => setCurrentView('landing')}
        onNavigateToApp={handleEnterApp}
        onExploreClick={() => setCurrentView('explore')}
        onReposPayClick={() => setCurrentView('reposPay')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-800 relative">
      {isLoginModalOpen && <LoginModal onLogin={handleLogin} />}
      {isLeadFormOpen && <LeadFormModal onSubmit={handleLeadFormClose} loggedInUser={loggedInUserId} initialData={customerDetails} />}
      
      <Header 
        navItems={['Home']}
        onRoiClick={() => setShowRoiCalculator(true)} 
        onHomeClick={() => setShowRoiCalculator(false)}
        rightNavItems={['FAQs']}
        onNavItemClick={(item) => {
            if (item === 'FAQs') setCurrentView('faq');
            if (item === 'Home') setCurrentView('landing');
        }}
        onSecretClick={() => setIsDiscountModalOpen(true)}
      />
      
      {showRoiCalculator ? (
        <div className="w-full h-[calc(100vh-72px)] bg-white">
          <iframe 
            src="https://repos-rps-roi-calculator.vercel.app/" 
            className="w-full h-full border-0"
            title="ROI Calculator"
          />
        </div>
      ) : (
        <main className="flex flex-col lg:flex-row">
          <div className="w-full lg:flex-1 lg:h-[calc(100vh-72px)] lg:sticky lg:top-[72px] h-[45vh] min-h-[300px] relative z-0 bg-gray-100">
            <CarVisualizer 
              tank={selectedTank}
              mechanicalOptions={selectedMechanicalInclusionOptions}
              dispensingUnits={selectedDispensingUnits}
              safetyUnits={selectedSafetyUnits}
              safetyUpgrades={selectedSafetyUpgrades}
              decantation={selectedDecantation}
              hasPlatform={showCapacityPreview}

              selectedProduct={selectedProduct}
              rfdZBase={rfdZBase}
              rfdZUpgrades={rfdZUpgrades}
            />
          </div>
          <div className="w-full lg:w-[400px] xl:w-[450px] lg:h-[calc(100vh-72px)] bg-white z-10 flex-shrink-0">
            <Configurator
              customerDetails={customerDetails}
              paymentMode={paymentMode}
              setPaymentMode={setPaymentMode}
              selectedTank={selectedTank}
              setSelectedTank={handleTankChange}
              selectedReposOsOptions={selectedReposOsOptions}
              onReposOsToggle={handleReposOsToggle}
              selectedMechanicalInclusionOptions={selectedMechanicalInclusionOptions}
              onMechanicalInclusionToggle={handleMechanicalInclusionToggle}
              
              selectedDecantation={selectedDecantation}
              onDecantationToggle={handleDecantationToggle}
              
              selectedDispensingUnits={selectedDispensingUnits}
              onDispensingUnitToggle={handleDispensingUnitToggle}
              
              selectedSafetyUnits={selectedSafetyUnits}
              onSafetyUnitToggle={handleSafetyUnitToggle}
              selectedSafetyUpgrades={selectedSafetyUpgrades}
              onSafetyUpgradeToggle={handleSafetyUpgradeToggle}
              selectedLicenseOptions={selectedLicenseOptions}
              
              rfidTagsQuantity={rfidTagsQuantity}
              setRfidTagsQuantity={setRfidTagsQuantity}

              selectedConsumption={selectedConsumption}
              onConsumptionSelect={handleConsumptionSelect}
              
              totalContractValue={totalContractValue}
              gstAmount={gstAmount}
              finalPrice={displayPrice}
              
              recommendedTankId={recommendedTankId}
              showPrices={showPrices}
              onResetConfiguration={resetConfiguration}
              
              onOpenComparison={() => setIsComparisonModalOpen(true)}
              onOpenQuote={() => {
                setPendingQuoteGeneration(true);
                setIsLeadFormOpen(true);
              }}
              onCalculateRoi={() => setShowRoiCalculator(true)}

              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}

              rfdZBase={rfdZBase}
              setRfdZBase={setRfdZBase}
              rfdZUpgrades={rfdZUpgrades}
              onRfdZUpgradeToggle={handleRfdZUpgradeToggle}
            />
          </div>
        </main>
      )}

      {isComparisonModalOpen && (
        <ComparisonModal onClose={() => setIsComparisonModalOpen(false)} showPrices={showPrices} />
      )}

      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount (INR)</label>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-semibold"
                autoFocus
                placeholder="Enter discount amount"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDiscountModalOpen(false)} 
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsDiscountModalOpen(false)} 
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
