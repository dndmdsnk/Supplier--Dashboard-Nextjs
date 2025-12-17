'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'ar' | 'zh';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    contracts: 'Contracts',
    newContract: 'New Contract',
    manageIssues: 'Manage Issues',
    profile: 'Profile',
    signOut: 'Sign Out',
    welcome: 'Welcome back',
    totalContracts: 'Total Contracts',
    totalWeight: 'Total Weight',
    avgItemsPerBox: 'Avg Items/Box',
    activeContracts: 'Active Contracts',
    recentContracts: 'Recent Contracts',
    recentActivity: 'Recent Activity',
    viewAll: 'View All',
    noContractsYet: 'No contracts yet',
    createFirstContract: 'Create your first contract to get started managing your shipments.',
    createContract: 'Create Contract',
  },
  es: {
    dashboard: 'Panel',
    analytics: 'Analítica',
    contracts: 'Contratos',
    newContract: 'Nuevo Contrato',
    manageIssues: 'Gestionar Problemas',
    profile: 'Perfil',
    signOut: 'Cerrar Sesión',
    welcome: 'Bienvenido de nuevo',
    totalContracts: 'Contratos Totales',
    totalWeight: 'Peso Total',
    avgItemsPerBox: 'Artículos/Caja Promedio',
    activeContracts: 'Contratos Activos',
    recentContracts: 'Contratos Recientes',
    recentActivity: 'Actividad Reciente',
    viewAll: 'Ver Todo',
    noContractsYet: 'Sin contratos aún',
    createFirstContract: 'Cree su primer contrato para comenzar a administrar sus envíos.',
    createContract: 'Crear Contrato',
  },
  fr: {
    dashboard: 'Tableau de Bord',
    analytics: 'Analytique',
    contracts: 'Contrats',
    newContract: 'Nouveau Contrat',
    manageIssues: 'Gérer les Problèmes',
    profile: 'Profil',
    signOut: 'Se Déconnecter',
    welcome: 'Bienvenue',
    totalContracts: 'Contrats Totaux',
    totalWeight: 'Poids Total',
    avgItemsPerBox: 'Articles/Boîte Moyen',
    activeContracts: 'Contrats Actifs',
    recentContracts: 'Contrats Récents',
    recentActivity: 'Activité Récente',
    viewAll: 'Voir Tout',
    noContractsYet: 'Pas encore de contrats',
    createFirstContract: 'Créez votre premier contrat pour commencer à gérer vos expéditions.',
    createContract: 'Créer un Contrat',
  },
  de: {
    dashboard: 'Armaturenbrett',
    analytics: 'Analytik',
    contracts: 'Verträge',
    newContract: 'Neuer Vertrag',
    manageIssues: 'Probleme Verwalten',
    profile: 'Profil',
    signOut: 'Abmelden',
    welcome: 'Willkommen zurück',
    totalContracts: 'Verträge Insgesamt',
    totalWeight: 'Gesamtgewicht',
    avgItemsPerBox: 'Durchschn. Artikel/Box',
    activeContracts: 'Aktive Verträge',
    recentContracts: 'Letzte Verträge',
    recentActivity: 'Letzte Aktivität',
    viewAll: 'Alle Anzeigen',
    noContractsYet: 'Noch keine Verträge',
    createFirstContract: 'Erstellen Sie Ihren ersten Vertrag, um mit der Verwaltung Ihrer Sendungen zu beginnen.',
    createContract: 'Vertrag Erstellen',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    analytics: 'التحليلات',
    contracts: 'العقود',
    newContract: 'عقد جديد',
    manageIssues: 'إدارة المشاكل',
    profile: 'الملف الشخصي',
    signOut: 'تسجيل الخروج',
    welcome: 'مرحبا بعودتك',
    totalContracts: 'إجمالي العقود',
    totalWeight: 'الوزن الإجمالي',
    avgItemsPerBox: 'متوسط العناصر/الصندوق',
    activeContracts: 'العقود النشطة',
    recentContracts: 'العقود الأخيرة',
    recentActivity: 'النشاط الأخير',
    viewAll: 'عرض الكل',
    noContractsYet: 'لا توجد عقود بعد',
    createFirstContract: 'أنشئ عقدك الأول لبدء إدارة شحناتك.',
    createContract: 'إنشاء عقد',
  },
  zh: {
    dashboard: '仪表板',
    analytics: '分析',
    contracts: '合同',
    newContract: '新合同',
    manageIssues: '管理问题',
    profile: '个人资料',
    signOut: '登出',
    welcome: '欢迎回来',
    totalContracts: '合同总数',
    totalWeight: '总重量',
    avgItemsPerBox: '平均项目/箱',
    activeContracts: '活跃合同',
    recentContracts: '最近的合同',
    recentActivity: '最近的活动',
    viewAll: '查看全部',
    noContractsYet: '还没有合同',
    createFirstContract: '创建您的第一份合同以开始管理您的货件。',
    createContract: '创建合同',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language;
    if (stored && translations[stored]) {
      setLanguageState(stored);
      document.documentElement.lang = stored;
      if (stored === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
