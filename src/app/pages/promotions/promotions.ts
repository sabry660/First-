import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface Promotion {
  id: number;
  title: string;
  discount: string;
  sub: string;
  desc: string;
  status: 'Active' | 'Scheduled' | 'Urgent' | 'Draft';
  validity: string;
  code: string;
  img: string;
  color: 'emerald' | 'blue' | 'red' | 'yellow';
  startDate?: string;
  endDate?: string;
}

interface StatCard {
  label: string;
  value: string;
  color?: string;
}

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promotions.html',
  styleUrls: ['./promotions.css']
})
export class Promotions implements OnInit, AfterViewInit {
  promotions: Promotion[] = [];
  stats: StatCard[] = [];
  isModalOpen: boolean = false;
  isCreating: boolean = false;
  promoForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPromotions();
    this.initializeStats();
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  private initializeForm(): void {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    this.promoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      discount: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      code: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['Active', Validators.required],
      startDate: [this.formatDate(today), Validators.required],
      endDate: [this.formatDate(nextMonth), Validators.required]
    });
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

    gsap.from('.promotions-list', { 
      opacity: 0, 
      y: 50, 
      duration: 0.7, 
      delay: 0.4,
      ease: "power2.out"
    });

    gsap.from('.modal-form', { 
      opacity: 0, 
      x: -50, 
      duration: 0.6, 
      delay: 0.6,
      ease: "power2.out"
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private loadPromotions(): void {
    // Load from localStorage or initialize with default data
    const savedPromotions = localStorage.getItem('promotions');
    
    if (savedPromotions) {
      this.promotions = JSON.parse(savedPromotions);
    } else {
      this.promotions = [
        { 
          id: 1,
          title: 'Summer Paradise Deal', 
          discount: '25% OFF', 
          sub: 'SUMMER SALE 2024', 
          desc: 'Applicable to all Deluxe and Ocean View suites for stays minimum 3 nights.', 
          status: 'Active', 
          validity: 'Jun 01 - Aug 31', 
          code: 'SUMMER25', 
          img: 'https://picsum.photos/seed/summer/400/225', 
          color: 'emerald' 
        },
        { 
          id: 2,
          title: 'Early Planner Reward', 
          discount: '15% OFF', 
          sub: 'EARLY BIRD SPECIAL', 
          desc: 'Book 30+ days in advance. Valid for Residential Units and Penthouses.', 
          status: 'Scheduled', 
          validity: 'Starts Oct 01, 2024', 
          code: 'EARLY30', 
          img: 'https://picsum.photos/seed/early/400/225', 
          color: 'blue' 
        },
        { 
          id: 3,
          title: 'Instant Flash Offer', 
          discount: '20% OFF', 
          sub: 'LAST MINUTE DEAL', 
          desc: 'Bookings within 48 hours of arrival. Selected standard rooms only.', 
          status: 'Urgent', 
          validity: 'Expires In 14h 22m', 
          code: 'LASTCALL', 
          img: 'https://picsum.photos/seed/flash/400/225', 
          color: 'red' 
        },
      ];
      this.savePromotions();
    }
  }

  private initializeStats(): void {
    const activeCount = this.promotions.filter(p => p.status === 'Active').length;
    const scheduledCount = this.promotions.filter(p => p.status === 'Scheduled').length;
    
    // Calculate average discount
    const discounts = this.promotions.map(p => {
      const discountValue = parseInt(p.discount.replace('% OFF', '').replace('OFF', '').trim());
      return isNaN(discountValue) ? 0 : discountValue;
    });
    const avgDiscount = discounts.length > 0 
      ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length) 
      : 0;

    this.stats = [
      { label: 'Active Promotions', value: activeCount.toString() },
      { label: 'Avg. Discount', value: `${avgDiscount}%` },
      { label: 'Redemptions (MoM)', value: '+1,240', color: 'text-emerald-500' },
      { label: 'Upcoming Deals', value: scheduledCount.toString() },
    ];
  }

  // Modal Methods
  openModal(): void {
    this.isModalOpen = true;
    // Reset form when opening modal
    this.promoForm.reset({
      title: '',
      discount: '',
      code: '',
      description: '',
      status: 'Active',
      startDate: this.formatDate(new Date()),
      endDate: this.formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 days from now
    });
  }

  closeModal(event?: Event): void {
    // Close only if clicking on backdrop or close button
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

  // Promotion Methods
  createPromotion(): void {
    if (this.promoForm.invalid) {
      this.markFormGroupTouched(this.promoForm);
      return;
    }

    this.isCreating = true;
    const formValue = this.promoForm.value;

    // Generate validity string
    const startDate = new Date(formValue.startDate);
    const endDate = new Date(formValue.endDate);
    const validity = this.formatValidityPeriod(startDate, endDate);

    // Generate sub title based on status
    const subTitles: { [key: string]: string } = {
      'Active': 'ACTIVE DEAL',
      'Scheduled': 'COMING SOON',
      'Urgent': 'LAST CHANCE',
      'Draft': 'DRAFT OFFER'
    };

    const newPromotion: Promotion = {
      id: Date.now(),
      title: formValue.title,
      discount: `${formValue.discount}% OFF`,
      sub: subTitles[formValue.status] || 'NEW OFFER',
      desc: formValue.description,
      status: formValue.status,
      validity: validity,
      code: formValue.code.toUpperCase(),
      img: `https://picsum.photos/seed/${Date.now()}/400/225`,
      color: this.getRandomColor(),
      startDate: formValue.startDate,
      endDate: formValue.endDate
    };

    // Simulate API call delay
    setTimeout(() => {
      this.promotions.unshift(newPromotion);
      this.savePromotions();
      this.updateStats();
      this.isCreating = false;
      this.isModalOpen = false;
      this.showSuccessMessage('Promotion created successfully!');
    }, 1000);
  }

  deletePromotion(id: number): void {
    if (confirm('Are you sure you want to delete this promotion?')) {
      this.promotions = this.promotions.filter(p => p.id !== id);
      this.savePromotions();
      this.updateStats();
      this.showSuccessMessage('Promotion deleted successfully!');
    }
  }

  // Helper Methods
  private savePromotions(): void {
    localStorage.setItem('promotions', JSON.stringify(this.promotions));
  }

  private updateStats(): void {
    this.initializeStats();
  }

  private formatValidityPeriod(startDate: Date, endDate: Date): string {
    const now = new Date();
    
    if (startDate > now) {
      return `Starts ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    
    if (endDate < now) {
      return 'Expired';
    }
    
    // Check if expires soon (within 24 hours)
    const hoursLeft = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursLeft < 24) {
      const hours = Math.floor(hoursLeft);
      const minutes = Math.floor((hoursLeft - hours) * 60);
      return `Expires In ${hours}h ${minutes}m`;
    }
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Scheduled': return 'bg-blue-500';
      case 'Urgent': return 'bg-rose-500';
      case 'Draft': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  }

  private getRandomColor(): Promotion['color'] {
    const colors: Promotion['color'][] = ['emerald', 'blue', 'red', 'yellow'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showSuccessMessage(message: string): void {
    // In a real app, you might use a toast notification service
    alert(message);
  }

  // Duplicate promotion
  duplicatePromotion(id: number): void {
    const promotion = this.promotions.find(p => p.id === id);
    if (promotion) {
      const duplicated = {
        ...promotion,
        id: Date.now(),
        title: `${promotion.title} (Copy)`,
        code: `${promotion.code}${Math.floor(Math.random() * 100)}`,
        img: `https://picsum.photos/seed/${Date.now()}/400/225`,
        status: 'Draft' as const
      };
      this.promotions.unshift(duplicated);
      this.savePromotions();
      this.updateStats();
      this.showSuccessMessage('Promotion duplicated successfully!');
    }
  }

  // Toggle promotion status
  togglePromotionStatus(id: number): void {
    const promotion = this.promotions.find(p => p.id === id);
    if (promotion) {
      const statusOrder: Promotion['status'][] = ['Draft', 'Scheduled', 'Active', 'Urgent'];
      const currentIndex = statusOrder.indexOf(promotion.status);
      const nextIndex = (currentIndex + 1) % statusOrder.length;
      promotion.status = statusOrder[nextIndex];
      
      // Update sub title based on new status
      const subTitles: { [key: string]: string } = {
        'Active': 'ACTIVE DEAL',
        'Scheduled': 'COMING SOON',
        'Urgent': 'LAST CHANCE',
        'Draft': 'DRAFT OFFER'
      };
      promotion.sub = subTitles[promotion.status] || 'NEW OFFER';
      
      this.savePromotions();
      this.updateStats();
      this.showSuccessMessage(`Promotion status changed to ${promotion.status}`);
    }
  }
}