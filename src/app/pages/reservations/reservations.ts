import { Component, OnInit, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { gsap } from 'gsap';

// ===== Interface Definitions =====
interface Reservation {
  id: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  price: number;
  paymentMethod: string;
}

interface Translation {
  title: string;
  sub: string;
  newRes: string;
  search: string;
  statusAll: string;
  apply: string;
  noResults: string;
}

interface TimelinePosition {
  offset: number;
  width: number;
}

interface ViewMode {
  type: 'list' | 'calendar';
  label: string;
}
// ===== End Interface Definitions =====

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.css']
})
export class Reservations implements OnInit, AfterViewInit {
  @ViewChild('container') container!: ElementRef;

  // ===== Data Properties =====
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  timelineDates: Date[] = [];
  roomTypes: string[] = [];

  // ===== UI State Properties =====
  viewMode: 'list' | 'calendar' = 'calendar';
  searchTerm: string = '';
  statusFilter: string = 'All Statuses';
  isModalOpen: boolean = false;
  showSuccess: boolean = false;
  isRtl: boolean = false;
  isCreating: boolean = false;

  // ===== Form Properties =====
  reservationForm!: FormGroup;

  // ===== Translation Properties =====
  private translations: { [key: string]: Translation } = {
    en: {
      title: "Reservations",
      sub: "Centralized booking management for your property portfolio.",
      newRes: "New Reservation",
      search: "SEARCH DIRECTORY",
      statusAll: "ALL STATUSES",
      apply: "Apply Filters",
      noResults: "No matching reservations found."
    },
    ar: {
      title: "الحجوزات",
      sub: "إدارة مركزية للحجوزات لمحفظة عقاراتك.",
      newRes: "حجز جديد",
      search: "البحث في الدليل",
      statusAll: "جميع الحالات",
      apply: "تطبيق المرشحات",
      noResults: "لم يتم العثور على حجوزات مطابقة."
    }
  };

  // ===== View Modes =====
  viewModes: ViewMode[] = [
    { type: 'list', label: 'List' },
    { type: 'calendar', label: 'Timeline' }
  ];

  // ===== Status Options =====
  statusOptions: string[] = ['All Statuses', 'Confirmed', 'Pending', 'Cancelled'];

  // ===== Mock Data =====
  private mockReservations: Reservation[] = [
    { 
      id: 'RES-24901', 
      guestName: 'Sarah Miller', 
      roomType: 'Deluxe Double Room', 
      checkIn: '2026-01-28', 
      checkOut: '2026-01-31', 
      status: 'Confirmed', 
      price: 450, 
      paymentMethod: 'Paid via Credit Card' 
    },
    { 
      id: 'RES-24902', 
      guestName: 'James Harrison', 
      roomType: 'Deluxe Two Bedroom Suite', 
      checkIn: '2026-02-02', 
      checkOut: '2026-02-05', 
      status: 'Pending', 
      price: 1200, 
      paymentMethod: 'Waiting for payment' 
    },
    { 
      id: 'RES-24903', 
      guestName: 'Linda Chen', 
      roomType: 'Deluxe One Bedroom Suite', 
      checkIn: '2026-02-10', 
      checkOut: '2026-02-12', 
      status: 'Cancelled', 
      price: 300, 
      paymentMethod: 'Refunded' 
    },
    { 
      id: 'RES-24904', 
      guestName: 'Robert King', 
      roomType: 'Deluxe Double Room', 
      checkIn: '2026-01-26', 
      checkOut: '2026-01-27', 
      status: 'Confirmed', 
      price: 150, 
      paymentMethod: 'Cash payment' 
    },
    { 
      id: 'RES-24905', 
      guestName: 'Michael Scott', 
      roomType: 'Executive Studio', 
      checkIn: '2026-02-05', 
      checkOut: '2026-02-10', 
      status: 'Pending', 
      price: 850, 
      paymentMethod: 'Credit Card' 
    },
    { 
      id: 'RES-24906', 
      guestName: 'Pam Beesly', 
      roomType: 'Deluxe Double Room', 
      checkIn: '2026-02-12', 
      checkOut: '2026-02-14', 
      status: 'Confirmed', 
      price: 300, 
      paymentMethod: 'Online Payment' 
    },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadReservations();
    this.updateTimelineDates();
    this.updateRoomTypes();
    this.updateFilteredReservations();
    
    // Check language direction
    const savedLang = localStorage.getItem('app-language') || 'en';
    this.isRtl = savedLang === 'ar';
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  // ===== Initialization Methods =====
  private initializeForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDaysLater = new Date(tomorrow);
    threeDaysLater.setDate(tomorrow.getDate() + 3);

    this.reservationForm = this.fb.group({
      guestName: ['', [Validators.required, Validators.minLength(2)]],
      roomType: ['Deluxe Double Room', Validators.required],
      checkIn: [this.formatDate(tomorrow), Validators.required],
      checkOut: [this.formatDate(threeDaysLater), Validators.required],
      price: ['500', [Validators.required, Validators.min(1)]],
      status: ['Confirmed', Validators.required]
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private loadReservations(): void {
    const savedReservations = localStorage.getItem('reservations');
    this.reservations = savedReservations ? JSON.parse(savedReservations) : [...this.mockReservations];
  }

  private initializeTimelineDates(): void {
    // This will be replaced by updateTimelineDates
  }

  private updateTimelineDates(): void {
    if (this.reservations.length === 0) {
      // Default to current month
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      this.timelineDates = [];
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        this.timelineDates.push(new Date(year, month, i));
      }
      return;
    }

    const allDates = this.reservations.flatMap(r => [new Date(r.checkIn), new Date(r.checkOut)]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    minDate.setDate(minDate.getDate() - 1); // Add buffer day before
    maxDate.setDate(maxDate.getDate() + 1); // Add buffer day after

    this.timelineDates = [];
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      this.timelineDates.push(new Date(d));
    }
  }

  private updateRoomTypes(): void {
    this.roomTypes = Array.from(new Set(this.reservations.map(r => r.roomType)));
  }

  // ===== Filter Methods =====
  updateFilteredReservations(): void {
    this.filteredReservations = this.reservations.filter((res) => {
      const matchesSearch = res.guestName.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                           res.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All Statuses' || res.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.updateFilteredReservations();
  }

  onStatusChange(): void {
    this.updateFilteredReservations();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'All Statuses';
    this.updateFilteredReservations();
  }

  // ===== Timeline Calculation =====
  getTimelinePosition(checkIn: string, checkOut: string): TimelinePosition {
    const startDate = this.timelineDates[0];
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const diffIn = Math.floor((checkInDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return { 
      offset: Math.max(diffIn, 0), 
      width: Math.max(duration, 1) 
    };
  }

  // ===== Reservation CRUD =====
  createReservation(): void {
    if (this.reservationForm.invalid) {
      this.markFormGroupTouched(this.reservationForm);
      return;
    }

    this.isCreating = true;
    const formValue = this.reservationForm.value;
    
    const newReservation: Reservation = {
      id: `RES-${Math.floor(Math.random() * 90000) + 10000}`,
      guestName: formValue.guestName,
      roomType: formValue.roomType,
      checkIn: formValue.checkIn,
      checkOut: formValue.checkOut,
      status: formValue.status,
      price: parseFloat(formValue.price),
      paymentMethod: 'Credit Card'
    };

    // Simulate API delay
    setTimeout(() => {
      this.reservations.unshift(newReservation);
      this.saveReservations();
      this.updateRoomTypes();
      this.updateFilteredReservations();
      this.updateTimelineDates();
      
      this.isCreating = false;
      this.isModalOpen = false;
      this.showSuccessMessage();
      
      // Reset form
      this.reservationForm.reset({
        guestName: '',
        roomType: 'Deluxe Double Room',
        checkIn: this.formatDate(new Date()),
        checkOut: this.formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
        price: '500',
        status: 'Confirmed'
      });
    }, 800);
  }

  editReservation(id: string): void {
    const reservation = this.reservations.find(r => r.id === id);
    if (reservation) {
      this.reservationForm.patchValue({
        guestName: reservation.guestName,
        roomType: reservation.roomType,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        price: reservation.price.toString(),
        status: reservation.status
      });
      this.isModalOpen = true;
    }
  }

  deleteReservation(id: string): void {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.reservations = this.reservations.filter(r => r.id !== id);
      this.saveReservations();
      this.updateRoomTypes();
      this.updateFilteredReservations();
      this.updateTimelineDates();
      this.showMessage('Reservation deleted successfully!');
    }
  }

  toggleReservationStatus(id: string): void {
    const reservation = this.reservations.find(r => r.id === id);
    if (reservation) {
      const statusOrder: Reservation['status'][] = ['Pending', 'Confirmed', 'Cancelled'];
      const currentIndex = statusOrder.indexOf(reservation.status);
      const nextIndex = (currentIndex + 1) % statusOrder.length;
      reservation.status = statusOrder[nextIndex];
      
      this.saveReservations();
      this.updateFilteredReservations();
      this.updateTimelineDates();
      this.showMessage(`Reservation status changed to ${reservation.status}`);
    }
  }

  // ===== Helper Methods =====
  private saveReservations(): void {
    localStorage.setItem('reservations', JSON.stringify(this.reservations));
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  }

  getStatusBorderClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'border-emerald-200';
      case 'Pending': return 'border-amber-200';
      case 'Cancelled': return 'border-red-200';
      default: return 'border-slate-200';
    }
  }

  getTimelineColorClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'bg-primary text-white border-primary shadow-primary/30';
      case 'Pending': return 'bg-amber-500 text-white border-amber-500 shadow-amber-500/30';
      case 'Cancelled': return 'bg-slate-300 text-slate-800 border-slate-300 shadow-slate-500/20';
      default: return 'bg-slate-100 text-slate-400 border-slate-200 shadow-none';
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  // ===== Modal Methods =====
  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(event?: Event): void {
    if (!event || (event.target as HTMLElement).classList.contains('bg-slate-900/60')) {
      this.isModalOpen = false;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event): void {
    if (this.isModalOpen) {
      this.closeModal();
    }
  }

  // ===== Animation Methods =====
  private initializeAnimations(): void {
    // Page load animations using GSAP
    gsap.from('.reservations-header', { 
      opacity: 0, 
      y: -50, 
      duration: 0.8,
      ease: "power2.out"
    });

    gsap.from('.filters-section', { 
      opacity: 0, 
      y: 20, 
      duration: 0.6, 
      delay: 0.3,
      ease: "power2.out"
    });

    gsap.from('.timeline-container', { 
      opacity: 0, 
      scale: 0.95, 
      duration: 1, 
      delay: 0.5,
      ease: "power2.out"
    });
  }

  private showSuccessMessage(): void {
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 1500);
  }

  private showMessage(message: string): void {
    // In a real app, use a toast notification service
    console.log('Message:', message);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // ===== Translation Methods =====
  getTranslation(key: keyof Translation): string {
    const lang = this.isRtl ? 'ar' : 'en';
    return this.translations[lang][key] || key;
  }

  toggleLanguage(): void {
    this.isRtl = !this.isRtl;
    localStorage.setItem('app-language', this.isRtl ? 'ar' : 'en');
  }

  // ===== View Mode Methods =====
  setViewMode(mode: 'list' | 'calendar'): void {
    this.viewMode = mode;
  }

  getViewModeLabel(mode: 'list' | 'calendar'): string {
    return mode === 'list' ? (this.isRtl ? 'قائمة' : 'List') : (this.isRtl ? 'الجدول' : 'Timeline');
  }

  getButtonClasses(mode: 'list' | 'calendar'): string {
    const baseClasses = 'px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2';
    const activeClasses = 'bg-primary text-white shadow-lg shadow-primary/30';
    const inactiveClasses = 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300';
    
    return `${baseClasses} ${this.viewMode === mode ? activeClasses : inactiveClasses}`;
  }

  // ===== Date Formatting =====
  formatDateDisplay(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  getDuration(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  // ===== Getters for Template =====
  get guestName() { return this.reservationForm.get('guestName'); }
  get roomType() { return this.reservationForm.get('roomType'); }
  get checkIn() { return this.reservationForm.get('checkIn'); }
  get checkOut() { return this.reservationForm.get('checkOut'); }
  get price() { return this.reservationForm.get('price'); }

  // Safe getter for filtered reservations to prevent undefined errors
  get safeFilteredReservations(): Reservation[] {
    return this.filteredReservations || [];
  }

  // Get filtered reservations by room type for timeline view
  getFilteredReservationsByRoomType(roomType: string): Reservation[] {
    return this.safeFilteredReservations.filter(r => r.roomType === roomType);
  }
}