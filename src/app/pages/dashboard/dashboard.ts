import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { gsap } from 'gsap';

// Register Chart.js components
Chart.register(...registerables);

interface ChartData {
  name: string;
  bookings: number;
}

interface RecentActivity {
  id: number;
  icon: string;
  iconColor: string;
  title: string;
  time: string;
  badge?: string;
  badgeColor?: string;
}

interface DashboardTranslations {
  [key: string]: {
    [key: string]: string;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('bookingChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('occupancyProgress') occupancyProgress!: ElementRef;
  @ViewChild('checkoutProgress') checkoutProgress!: ElementRef;
  
  private chart!: Chart;
  
  aiInsight: string = '';
  loadingAi: boolean = false;
  isRtl: boolean = false;
  chartType: string = 'bar';
  
  chartData: ChartData[] = [
    { name: 'Jan 20', bookings: 12 },
    { name: 'Jan 23', bookings: 9 },
    { name: 'Jan 26', bookings: 16 },
    { name: 'Jan 29', bookings: 11 },
    { name: 'Feb 01', bookings: 18 },
    { name: 'Feb 03', bookings: 14 },
    { name: 'Feb 05', bookings: 8 },
    { name: 'Feb 07', bookings: 13 },
    { name: 'Feb 09', bookings: 17 },
    { name: 'Feb 11', bookings: 10 },
    { name: 'Feb 13', bookings: 19 },
    { name: 'Feb 15', bookings: 15 },
  ];

  recentActivities: RecentActivity[] = [
    {
      id: 1,
      icon: 'person_add',
      iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      title: 'New reservation from Saudi Arabia',
      time: '2 minutes ago',
      badge: 'VIP',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    },
    {
      id: 2,
      icon: 'check_circle',
      iconColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      title: 'Check-in completed for Room 302',
      time: '15 minutes ago'
    },
    {
      id: 3,
      icon: 'payment',
      iconColor: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      title: 'Payment received for booking #4521',
      time: '1 hour ago'
    },
    {
      id: 4,
      icon: 'bed',
      iconColor: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      title: 'Room upgrade requested',
      time: '2 hours ago',
      badge: 'Pending',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    }
  ];
  
  private translations: DashboardTranslations = {
    en: {
      aiInsight: "AI Smart Insight",
      fullAnalysis: "Full Analysis",
      occupancy: "Occupancy Rate",
      revenue: "Monthly Revenue",
      checkins: "Check-ins Remaining",
      checkouts: "Check-outs Done",
      bookingTrends: "Booking Trends",
      trendsSub: "Visual performance for the current period",
      quickActions: "Quick Actions",
      newRes: "New Reservation",
      updateRates: "Update Room Rates",
      stopSell: "Stop Sell Dates",
      recentActivity: "Recent Booking Activity"
    },
    ar: {
      aiInsight: "رؤية الذكاء الاصطناعي",
      fullAnalysis: "تحليل كامل",
      occupancy: "معدل الإشغال",
      revenue: "الإيرادات الشهرية",
      checkins: "تسجيلات الدخول المتبقية",
      checkouts: "تسجيلات الخروج المكتملة",
      bookingTrends: "اتجاهات الحجز",
      trendsSub: "الأداء البصري للفترة الحالية",
      quickActions: "إجراءات سريعة",
      newRes: "حجز جديد",
      updateRates: "تحديث أسعار الغرف",
      stopSell: "إيقاف المبيعات",
      recentActivity: "نشاط الحجز الأخير"
    }
  };

  constructor(
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Check language from localStorage or browser
    const savedLang = localStorage.getItem('dashboard-language') || 
                     (navigator.language.startsWith('ar') ? 'ar' : 'en');
    this.isRtl = savedLang === 'ar';
    this.setLanguageDirection();
    
    this.initializeAIInsight();
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
    this.initializeChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private setLanguageDirection(): void {
    document.documentElement.dir = this.isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = this.isRtl ? 'ar' : 'en';
  }

  toggleLanguage(): void {
    this.isRtl = !this.isRtl;
    this.setLanguageDirection();
    localStorage.setItem('dashboard-language', this.isRtl ? 'ar' : 'en');
    this.initializeAIInsight();
  }

  private initializeAnimations(): void {
    // Page load animations using GSAP
    gsap.from('.page-title', { 
      opacity: 0, 
      y: -30, 
      duration: 0.6,
      ease: "power2.out"
    });

    gsap.from('.stats-grid', { 
      opacity: 0, 
      scale: 0.9, 
      duration: 0.8, 
      delay: 0.2,
      ease: "back.out(1.7)"
    });

    gsap.from('.chart-section', { 
      opacity: 0, 
      y: 50, 
      duration: 0.7, 
      delay: 0.4,
      ease: "power2.out"
    });

    gsap.from('.activity-section', { 
      opacity: 0, 
      x: 50, 
      duration: 0.6, 
      delay: 0.6,
      ease: "power2.out"
    });

    // Animate progress bars with GSAP
    setTimeout(() => {
      if (this.occupancyProgress) {
        gsap.to(this.occupancyProgress.nativeElement, { width: '84.2%', duration: 1, ease: "power2.out" });
      }
      if (this.checkoutProgress) {
        gsap.to(this.checkoutProgress.nativeElement, { width: '66%', duration: 1, ease: "power2.out" });
      }
    }, 500);
  }

  private initializeChart(): void {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      setTimeout(() => this.initializeChart(), 100);
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.chartData.map(item => item.name);
    const data = this.chartData.map(item => item.bookings);

    const isBar = this.chartType === 'bar';
    const dataset = {
      label: 'Bookings',
      data: data,
      borderColor: '#4E49E7',
      borderWidth: isBar ? 1 : 2,
      ...(isBar ? {
        backgroundColor: this.chartData.map((_, index) => 
          index === this.chartData.length - 1 ? 'rgba(78, 73, 231, 1)' : 'rgba(78, 73, 231, 0.2)'
        ),
        borderRadius: 4,
        borderSkipped: false,
      } : {
        backgroundColor: 'rgba(78, 73, 231, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#4E49E7',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      })
    };

    this.chart = new Chart(ctx, {
      type: this.chartType as 'bar' | 'line',
      data: {
        labels: labels,
        datasets: [dataset]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 20,
            right: this.isRtl ? 0 : 20,
            left: this.isRtl ? 20 : 0
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 10
              },
              color: '#94a3b8',
              maxRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.5)',
              drawTicks: false
            },
            ticks: {
              font: {
                size: 10
              },
              color: '#94a3b8',
              padding: 10
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'white',
            titleColor: '#1e293b',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12,
            boxPadding: 6,
            displayColors: false,
            callbacks: {
              label: (context) => {
                return `${this.isRtl ? 'الحجوزات' : 'Bookings'}: ${context.parsed.y}`;
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            this.navigateTo('/reservations');
          }
        }
      }
    });
  }

  setChartType(type: string): void {
    this.chartType = type;
    this.initializeChart();
  }

  private async initializeAIInsight(): Promise<void> {
    this.loadingAi = true;
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (this.isRtl) {
        this.aiInsight = 'معدل الإشغال جيد عند 84% مع إمكانية تحسين الإيرادات من خلال التسعير الديناميكي للوحدات المتبقية. يوصى بمراجعة الأسعار للغرف المتبقية لزيادة الإيرادات.';
      } else {
        this.aiInsight = 'Occupancy is healthy at 84% with revenue optimization potential through dynamic pricing for remaining units. Consider rate adjustments for open inventory to maximize revenue.';
      }
    } catch (error) {
      this.aiInsight = this.isRtl 
        ? 'ينصح بالتسعير الديناميكي للوحدات المتبقية.'
        : 'Dynamic pricing recommended for remaining inventory.';
    } finally {
      this.loadingAi = false;
    }
  }

  // Helper Methods for Template
  getTranslation(key: string): string {
    const lang = this.isRtl ? 'ar' : 'en';
    return this.translations[lang][key] || key;
  }

  getAICardClass(): string {
    const baseClass = 'bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 sm:p-5 rounded-xl flex flex-col md:flex-row items-center gap-4 sm:gap-6';
    return this.isRtl ? `${baseClass} md:flex-row-reverse` : baseClass;
  }

  getMainSectionClass(): string {
    const baseClass = 'grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 dashboard-section';
    return this.isRtl ? `${baseClass} direction-rtl` : baseClass;
  }

  getChartHeaderClass(): string {
    const baseClass = 'p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col xs:flex-row justify-between items-center gap-4';
    return this.isRtl ? `${baseClass} flex-row-reverse` : baseClass;
  }

  getActionButtonClass(isPrimary: boolean): string {
    const primaryClass = 'w-full flex items-center justify-between p-4 bg-[#554df7] text-white rounded-2xl hover:bg-[#4a42e5] transition-all group shadow-lg shadow-indigo-500/20 active:scale-95';
    const secondaryClass = 'w-full flex items-center justify-between p-4 bg-[#f1f5f9] dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200/50 dark:border-slate-700 hover:bg-[#e2e8f0] dark:hover:bg-slate-800 transition-all group active:scale-95';
    
    const baseClass = isPrimary ? primaryClass : secondaryClass;
    return this.isRtl ? `${baseClass} flex-row-reverse` : baseClass;
  }

  getButtonInnerClass(): string {
    return this.isRtl 
      ? 'flex items-center gap-4 flex-row-reverse' 
      : 'flex items-center gap-4';
  }

  // Navigation Methods
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Add activity method
  addNewActivity(): void {
    const newActivity: RecentActivity = {
      id: this.recentActivities.length + 1,
      icon: 'notification_add',
      iconColor: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
      title: this.isRtl ? 'إشعار جديد' : 'New notification',
      time: 'Just now',
      badge: 'New',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    
    this.recentActivities.unshift(newActivity);
    
    // Limit to 5 activities
    if (this.recentActivities.length > 5) {
      this.recentActivities.pop();
    }
  }
}