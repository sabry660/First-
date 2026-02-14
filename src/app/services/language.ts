import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private lang$ = new BehaviorSubject<Language>((localStorage.getItem('appLanguage') as Language) || 'en');

  translations: any = {
    en: {
      inventoryCalendar: "Inventory Calendar",
      performanceOverview: "Performance Overview",
      reservations: "Reservations",
      bulkUpdates: "Bulk Updates",
      rateManagement: "Rate Management",
      financialReports: "Financial Reports",
      promotions: "Promotions",
      staffManagement: "Staff Management",
      profileSettings: "Profile Settings",
      systemSettings: "System Settings",
      managementSuite: "Management Suite",
      lastSynced: "Last synced: Just now",
      searchPlaceholder: "Search anything...",
      inventoryTitle: "INVENTORY",
      analysisTitle: "ANALYSIS",
      propertyManager: "Property Manager",
      inventorySystem: "Inventory System",
      signOut: "Sign Out"
    },
    ar: {
      inventoryCalendar: "تقويم المخزون",
      performanceOverview: "نظرة عامة على الأداء",
      reservations: "الحجوزات",
      bulkUpdates: "تحديثات جماعية",
      rateManagement: "إدارة الأسعار",
      financialReports: "التقارير المالية",
      promotions: "العروض الترويجية",
      staffManagement: "إدارة الموظفين",
      profileSettings: "إعدادات الملف الشخصي",
      systemSettings: "إعدادات النظام",
      managementSuite: "جناح الإدارة",
      lastSynced: "آخر مزامنة: الآن",
      searchPlaceholder: "ابحث عن أي شيء...",
      inventoryTitle: "المخزون",
      analysisTitle: "التحليل",
      propertyManager: "مدير العقار",
      inventorySystem: "نظام المخزون",
      signOut: "تسجيل الخروج"
    }
  };

  get language() { return this.lang$.value; }
  get isRtl() { return this.language === 'ar'; }
  get t() { return (key: string) => this.translations[this.language][key] || key; }

  setLanguage(lang: Language) {
    localStorage.setItem('appLanguage', lang);
    this.lang$.next(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = this.isRtl ? 'rtl' : 'ltr';
  }
}
