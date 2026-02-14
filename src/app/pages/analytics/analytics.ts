import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import gsap from 'gsap';

// Register Chart.js components
Chart.register(...registerables);

interface ChartData {
  name: string;
  value: number;
}

interface AreaChartData {
  name: string;
  series: { name: string; value: number }[];
}

interface RoomPerformance {
  roomType: string;
  occupancy: string;
  adr: string;
  revpar: string;
  cancellations: string;
  revenue: string;
  trend: 'up' | 'down';
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('lineChart') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartCanvas!: ElementRef<HTMLCanvasElement>;

  private lineChart!: Chart;
  private pieChart!: Chart;

  // Theme & RTL
  isRtl = false;
  darkMode = false;

  // Toast & processing
  showSuccess = false;
  isProcessing = false;

  // Filters
  selectedDateRange: string = 'Jan 26, 2026 - Feb 26, 2026';
  selectedRoomType: string = 'All Room Types';
  selectedComparison: string = 'Compare: Previous Period';
  dateRanges = [
    'Jan 26, 2026 - Feb 26, 2026',
    'Dec 26, 2025 - Jan 26, 2026',
    'Nov 26, 2025 - Dec 26, 2025'
  ];
  roomTypes = ['All Room Types', 'Deluxe Double', 'Executive Suite', 'Single Standard'];
  comparisons = ['Compare: Previous Period', 'Compare: Last Year', 'Compare: Same Month Last Year'];

  // Calendar
  showDatePicker: boolean = false;
  startDate: Date | null = new Date('2026-01-26');
  endDate: Date | null = new Date('2026-02-26');
  currentMonth: Date = new Date();

  // Stats Cards
  stats = [
    { label: 'RevPAR', value: 'SAR 425.20', trend: '12.5%', icon: 'payments', color: 'indigo' },
    { label: 'ADR', value: 'SAR 680.00', trend: '4.2%', icon: 'equalizer', color: 'orange' },
    { label: 'Occupancy', value: '78.4%', trend: '-2.1%', icon: 'bed', color: 'blue' },
    { label: 'Revenue', value: 'SAR 142.5K', trend: '8.8%', icon: 'account_balance_wallet', color: 'emerald' },
  ];

  // Line Chart Data
  areaChartData: AreaChartData[] = [
    { name: 'Occupancy', series: [
      { name: 'Jan 26', value: 60 },
      { name: 'Jan 28', value: 55 },
      { name: 'Jan 30', value: 40 },
      { name: 'Feb 01', value: 70 },
      { name: 'Feb 03', value: 50 },
      { name: 'Feb 05', value: 45 },
      { name: 'Feb 07', value: 40 },
      { name: 'Feb 09', value: 55 },
      { name: 'Feb 11', value: 60 },
    ]},
    { name: 'ADR', series: [
      { name: 'Jan 26', value: 40 },
      { name: 'Jan 28', value: 45 },
      { name: 'Jan 30', value: 55 },
      { name: 'Feb 01', value: 80 },
      { name: 'Feb 03', value: 60 },
      { name: 'Feb 05', value: 50 },
      { name: 'Feb 07', value: 40 },
      { name: 'Feb 09', value: 65 },
      { name: 'Feb 11', value: 50 },
    ]}
  ];

  // Pie Chart Data
  pieChartData: ChartData[] = [
    { name: 'Direct', value: 45 },
    { name: 'Booking.com', value: 28 },
    { name: 'Expedia', value: 15 },
    { name: 'Others', value: 12 },
  ];

  // Room Performance Data
  roomPerformanceData: RoomPerformance[] = [
    {
      roomType: 'Deluxe Double Room',
      occupancy: '82.5%',
      adr: 'SAR 450.00',
      revpar: 'SAR 371.25',
      cancellations: '4.2%',
      revenue: 'SAR 62,400',
      trend: 'up'
    },
    {
      roomType: 'Executive Suite',
      occupancy: '68.2%',
      adr: 'SAR 1,200.00',
      revpar: 'SAR 818.40',
      cancellations: '1.5%',
      revenue: 'SAR 48,200',
      trend: 'up'
    },
    {
      roomType: 'Single Standard',
      occupancy: '91.4%',
      adr: 'SAR 280.00',
      revpar: 'SAR 255.92',
      cancellations: '8.9%',
      revenue: 'SAR 31,900',
      trend: 'down'
    }
  ];

  // Revenue Channel Data
  revenueChannels = [
    { name: 'Direct Website', percentage: 45, color: 'bg-primary' },
    { name: 'Booking.com', percentage: 28, color: 'bg-indigo-400' },
    { name: 'Expedia', percentage: 15, color: 'bg-indigo-300' },
    { name: 'Other OTAs', percentage: 12, color: 'bg-indigo-200' }
  ];

  totalBookings: number = 1248;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  ngAfterViewInit(): void {
    if (this.container) {
      gsap.from(".stat-card", { opacity: 0, y: 20, scale: 0.95, stagger: 0.1, duration: 0.6, ease: "power2.out" });
      gsap.from(".chart-section", { opacity: 0, y: 30, duration: 0.8, delay: 0.3, ease: "power3.out" });
    }
    // Add delay to ensure DOM is fully rendered
    setTimeout(() => {
      this.initializeCharts();
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
  }

  private initializeCharts(): void {
    this.initializeLineChart();
    this.initializePieChart();
  }

  private initializeLineChart(): void {
    if (!this.lineChartCanvas || !this.lineChartCanvas.nativeElement) {
      setTimeout(() => this.initializeLineChart(), 200);
      return;
    }

    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      setTimeout(() => this.initializeLineChart(), 200);
      return;
    }

    // Destroy existing chart if it exists
    if (this.lineChart) {
      this.lineChart.destroy();
    }

    const labels = this.areaChartData[0].series.map(item => item.name);
    const occupancyData = this.areaChartData[0].series.map(item => item.value);
    const adrData = this.areaChartData[1].series.map(item => item.value);

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Occupancy',
            data: occupancyData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'ADR',
            data: adrData,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            backgroundColor: 'white',
            titleColor: '#1e293b',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#94a3b8'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            },
            ticks: {
              color: '#94a3b8'
            }
          }
        }
      }
    });
  }

  private initializePieChart(): void {
    if (!this.pieChartCanvas || !this.pieChartCanvas.nativeElement) {
      setTimeout(() => this.initializePieChart(), 200);
      return;
    }

    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      setTimeout(() => this.initializePieChart(), 200);
      return;
    }

    // Destroy existing chart if it exists
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const labels = this.pieChartData.map(item => item.name);
    const data = this.pieChartData.map(item => item.value);
    const colors = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'];

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: 'white',
            titleColor: '#1e293b',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12
          }
        }
      }
    });
  }

  // Filter Methods
  onDateRangeChange(event: any): void {
    this.selectedDateRange = event.target.value;
    this.updateDataBasedOnFilters();
  }

  onRoomTypeChange(event: any): void {
    this.selectedRoomType = event.target.value;
    this.updateDataBasedOnFilters();
  }

  onComparisonChange(event: any): void {
    this.selectedComparison = event.target.value;
    this.updateDataBasedOnFilters();
  }

  private updateDataBasedOnFilters(): void {
    // Simulate data update based on filters
    this.isProcessing = true;
    
    setTimeout(() => {
      // Update stats based on selected filters
      this.updateStats();
      this.updateCharts();
      this.updateRoomPerformance();
      
      this.isProcessing = false;
      this.showSuccess = true;
      setTimeout(() => this.showSuccess = false, 3000);
    }, 1000);
  }

  private updateStats(): void {
    // Simulate different stats based on filters
    const multiplier = this.selectedRoomType === 'Executive Suite' ? 1.5 : 
                       this.selectedRoomType === 'Deluxe Double' ? 1.2 : 
                       this.selectedRoomType === 'Single Standard' ? 0.8 : 1;

    this.stats = [
      { 
        label: 'RevPAR', 
        value: `SAR ${(425.20 * multiplier).toFixed(2)}`, 
        trend: `${(12.5 * multiplier).toFixed(1)}%`, 
        icon: 'payments', 
        color: 'indigo' 
      },
      { 
        label: 'ADR', 
        value: `SAR ${(680.00 * multiplier).toFixed(2)}`, 
        trend: `${(4.2 * multiplier).toFixed(1)}%`, 
        icon: 'equalizer', 
        color: 'orange' 
      },
      { 
        label: 'Occupancy', 
        value: `${(78.4 * multiplier).toFixed(1)}%`, 
        trend: `${(-2.1 * multiplier).toFixed(1)}%`, 
        icon: 'bed', 
        color: 'blue' 
      },
      { 
        label: 'Revenue', 
        value: `SAR ${(142.5 * multiplier).toFixed(1)}K`, 
        trend: `${(8.8 * multiplier).toFixed(1)}%`, 
        icon: 'account_balance_wallet', 
        color: 'emerald' 
      },
    ];
  }

  private updateCharts(): void {
    // Update line chart data
    if (this.lineChart) {
      const multiplier = this.selectedRoomType === 'Executive Suite' ? 1.3 : 1;
      const newOccupancyData = this.areaChartData[0].series.map(item => ({
        ...item,
        value: Math.round(item.value * multiplier)
      }));
      
      this.lineChart.data.datasets[0].data = newOccupancyData.map(item => item.value);
      this.lineChart.update();
    }
  }

  private updateRoomPerformance(): void {
    // Filter room performance data based on selected room type
    if (this.selectedRoomType !== 'All Room Types') {
      this.roomPerformanceData = this.roomPerformanceData.filter(room => 
        room.roomType.includes(this.selectedRoomType.replace(' Room', ''))
      );
    } else {
      // Reset to all data
      this.roomPerformanceData = [
        {
          roomType: 'Deluxe Double Room',
          occupancy: '82.5%',
          adr: 'SAR 450.00',
          revpar: 'SAR 371.25',
          cancellations: '4.2%',
          revenue: 'SAR 62,400',
          trend: 'up'
        },
        {
          roomType: 'Executive Suite',
          occupancy: '68.2%',
          adr: 'SAR 1,200.00',
          revpar: 'SAR 818.40',
          cancellations: '1.5%',
          revenue: 'SAR 48,200',
          trend: 'up'
        },
        {
          roomType: 'Single Standard',
          occupancy: '91.4%',
          adr: 'SAR 280.00',
          revpar: 'SAR 255.92',
          cancellations: '8.9%',
          revenue: 'SAR 31,900',
          trend: 'down'
        }
      ];
    }
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
  }

  toggleRtl() {
    this.isRtl = !this.isRtl;
  }

  handleAction(type: 'export' | 'report') {
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.showSuccess = true;
      setTimeout(() => this.showSuccess = false, 3000);
    }, 1500);
  }

  viewDetailedReport(): void {
    console.log('Viewing detailed report for:', this.selectedRoomType);
    // Navigate to detailed report or open modal
  }

  // Calendar Methods
  openDatePicker(): void {
    this.showDatePicker = true;
  }

  closeDatePicker(): void {
    this.showDatePicker = false;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  updateDateRange(): void {
    if (this.startDate && this.endDate) {
      this.selectedDateRange = `${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`;
      this.closeDatePicker();
      this.updateDataBasedOnFilters();
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1);
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
  }

  selectDate(date: Date): void {
    if (!this.startDate || (this.startDate && this.endDate)) {
      this.startDate = date;
      this.endDate = null;
    } else {
      if (date < this.startDate) {
        this.endDate = this.startDate;
        this.startDate = date;
      } else {
        this.endDate = date;
      }
    }
  }

  isDateSelected(date: Date): boolean {
    const startSelected = this.startDate && this.isSameDay(date, this.startDate);
    const endSelected = this.endDate && this.isSameDay(date, this.endDate);
    return !!(startSelected || endSelected);
  }

  isDateInRange(date: Date): boolean {
    if (!this.startDate || !this.endDate) return false;
    return date > this.startDate && date < this.endDate;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  getDaysInMonth(): Date[] {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add empty cells for days before month starts
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(new Date(year, month, -startDay + i + 1));
    }

    // Add all days in month
    for (let date = 1; date <= lastDay.getDate(); date++) {
      days.push(new Date(year, month, date));
    }

    return days;
  }
}
