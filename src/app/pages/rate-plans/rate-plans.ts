import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// ===== Interface Definitions =====
interface RatePlan {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Paused';
  strategy: string;
  icon: string;
  color: 'green' | 'blue' | 'orange' | 'purple' | 'red';
  features: string[];
}

interface Strategy {
  value: string;
  label: string;
}

interface PlanStats {
  active: number;
  paused: number;
  total: number;
}
// ===== End Interface Definitions =====

@Component({
  selector: 'app-rate-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rate-plans.html',
  styleUrls: ['./rate-plans.css']
})
export class RatePlans implements OnInit, AfterViewInit {
  // ===== Data Properties =====
  plans: RatePlan[] = [];
  
  strategies: Strategy[] = [
    { value: 'Base Rate', label: 'Base Rate' },
    { value: 'Base - 10%', label: 'Base - 10%' },
    { value: 'Base - 15%', label: 'Base - 15%' },
    { value: 'Base + 45 SAR', label: 'Base + 45 SAR' },
    { value: 'Dynamic (AI Guided)', label: 'Dynamic (AI Guided)' },
    { value: 'Seasonal Premium', label: 'Seasonal Premium' },
    { value: 'Last Minute', label: 'Last Minute' },
    { value: 'Corporate Rate', label: 'Corporate Rate' }
  ];

  // ===== UI State Properties =====
  isModalOpen: boolean = false;
  isSaving: boolean = false;
  editingPlan: RatePlan | null = null;
  planForm!: FormGroup;

  // ===== Helper Properties =====
  private colorIcons: { [key: string]: string } = {
    'green': 'check_circle',
    'blue': 'restaurant',
    'orange': 'lock',
    'purple': 'schedule',
    'red': 'flash_on'
  };

  private colorClasses: { [key: string]: string } = {
    'green': 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    'blue': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    'orange': 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    'purple': 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    'red': 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPlans();
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  // ===== Form Initialization =====
  private initializeForm(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      strategy: ['Base Rate', Validators.required],
      status: ['Active', Validators.required],
      features: ['Free cancellation 24h before\nStandard Terms Apply']
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

    gsap.from('.plans-grid', { 
      opacity: 0, 
      y: 50, 
      duration: 0.7, 
      delay: 0.4,
      ease: "power2.out"
    });

    gsap.from('.page-footer', { 
      opacity: 0, 
      y: 30, 
      duration: 0.5, 
      delay: 0.6,
      ease: "power2.out"
    });
  }

  // ===== Data Loading =====
  private loadPlans(): void {
    const savedPlans = localStorage.getItem('ratePlans');
    
    if (savedPlans) {
      this.plans = JSON.parse(savedPlans);
    } else {
      this.loadDefaultPlans();
    }
  }

  private loadDefaultPlans(): void {
    this.plans = [
      { 
        id: 'RP-90214', 
        name: 'Standard Room Only', 
        description: 'Basic rate with no meals included. Ideal for short stays and business travelers who prefer dining out.', 
        status: 'Active' as const, 
        strategy: 'Base Rate', 
        icon: 'check_circle', 
        color: 'green', 
        features: ['Free cancellation 24h before', 'Deluxe Double, 2BR Suite', 'Min. Stay: 1 Night'] 
      },
      { 
        id: 'RP-90215', 
        name: 'Bed & Breakfast', 
        description: 'Includes a full continental breakfast buffet for all guests staying in the room.', 
        status: 'Active' as const, 
        strategy: 'Base + 45 SAR', 
        icon: 'restaurant', 
        color: 'blue', 
        features: ['Free cancellation 48h before', 'All Room Types', 'Min. Stay: 1 Night'] 
      },
      { 
        id: 'RP-90216', 
        name: 'Non-Refundable Saver', 
        description: 'Best value for travelers with firm plans. Full prepayment required at time of booking.', 
        status: 'Active' as const, 
        strategy: 'Base - 10%', 
        icon: 'lock', 
        color: 'orange', 
        features: ['No refund on cancellation', 'Standard & Deluxe Double', 'Min. Stay: 1 Night'] 
      },
      { 
        id: 'RP-90217', 
        name: 'Early Bird Special', 
        description: 'Book at least 30 days in advance to unlock exclusive discounted rates.', 
        status: 'Paused' as const, 
        strategy: 'Base - 15%', 
        icon: 'schedule', 
        color: 'purple', 
        features: ['50% refund until 7 days', 'Book >30 Days in advance', 'Min. Stay: 2 Nights'] 
      },
    ];
    this.savePlans();
  }

  // ===== Modal Methods =====
  openModal(plan?: RatePlan): void {
    this.editingPlan = plan || null;
    this.isModalOpen = true;
    
    if (plan) {
      // Edit mode
      this.planForm.patchValue({
        name: plan.name,
        description: plan.description,
        strategy: plan.strategy,
        status: plan.status,
        features: plan.features.join('\n')
      });
    } else {
      // Create mode
      this.planForm.reset({
        name: '',
        description: '',
        strategy: 'Base Rate',
        status: 'Active',
        features: 'Free cancellation 24h before\nStandard Terms Apply'
      });
    }
  }

  closeModal(event?: Event): void {
    if (!event || (event.target as HTMLElement).classList.contains('bg-black/60')) {
      this.isModalOpen = false;
      this.editingPlan = null;
      this.planForm.reset();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event): void {
    if (this.isModalOpen) {
      this.closeModal();
    }
  }

  // ===== CRUD Operations =====
  savePlan(): void {
    if (this.planForm.invalid) {
      this.markFormGroupTouched(this.planForm);
      return;
    }

    this.isSaving = true;
    const formValue = this.planForm.value;
    
    // Parse features from textarea
    const features = formValue.features
      .split('\n')
      .filter((f: string) => f.trim())
      .map((f: string) => f.trim());

    // Generate random color
    const colors: RatePlan['color'][] = ['green', 'blue', 'orange', 'purple', 'red'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Simulate API delay
    setTimeout(() => {
      if (this.editingPlan) {
        // Update existing plan
        const index = this.plans.findIndex(p => p.id === this.editingPlan!.id);
        if (index !== -1) {
          this.plans[index] = {
            ...this.editingPlan,
            name: formValue.name,
            description: formValue.description,
            strategy: formValue.strategy,
            status: formValue.status,
            features: features,
            icon: this.colorIcons[randomColor] || 'stars',
            color: randomColor
          };
        }
      } else {
        // Create new plan
        const newPlan: RatePlan = {
          id: `RP-${Math.floor(Math.random() * 90000) + 10000}`,
          name: formValue.name,
          description: formValue.description,
          status: formValue.status,
          strategy: formValue.strategy,
          icon: this.colorIcons[randomColor] || 'stars',
          color: randomColor,
          features: features
        };
        this.plans.unshift(newPlan);
      }

      this.savePlans();
      this.isSaving = false;
      this.isModalOpen = false;
      this.editingPlan = null;
      this.showSuccessMessage(this.editingPlan ? 'Plan updated successfully!' : 'Plan created successfully!');
    }, 800);
  }

  duplicatePlan(id: string): void {
    const plan = this.plans.find(p => p.id === id);
    if (plan) {
      const duplicated: RatePlan = {
        ...plan,
        id: `RP-${Math.floor(Math.random() * 90000) + 10000}`,
        name: `${plan.name} (Copy)`,
        status: 'Active'
      };
      this.plans.unshift(duplicated);
      this.savePlans();
      this.showSuccessMessage('Plan duplicated successfully!');
    }
  }

  deletePlan(id: string): void {
    if (confirm('Are you sure you want to delete this rate plan?')) {
      this.plans = this.plans.filter(p => p.id !== id);
      this.savePlans();
      this.showSuccessMessage('Plan deleted successfully!');
    }
  }

  togglePlanStatus(id: string): void {
    const plan = this.plans.find(p => p.id === id);
    if (plan) {
      plan.status = plan.status === 'Active' ? 'Paused' : 'Active';
      this.savePlans();
      this.showSuccessMessage(`Plan ${plan.status === 'Active' ? 'activated' : 'paused'} successfully!`);
    }
  }

  // ===== Helper Methods =====
  private savePlans(): void {
    localStorage.setItem('ratePlans', JSON.stringify(this.plans));
  }

  getActiveCount(): number {
    return this.plans.filter(p => p.status === 'Active').length;
  }

  getPausedCount(): number {
    return this.plans.filter(p => p.status === 'Paused').length;
  }

  getColorClass(color: string): string {
    return this.colorClasses[color] || 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }

  getStatusClass(status: string): string {
    return status === 'Active' 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' 
      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
  }

  viewRules(id: string): void {
    const plan = this.plans.find(p => p.id === id);
    if (plan) {
      alert(`Viewing rules for: ${plan.name}\nStrategy: ${plan.strategy}\nStatus: ${plan.status}`);
    }
  }

  openGuide(): void {
    alert('Opening Strategy Guide...');
  }

  openRevenueTools(): void {
    alert('Opening Revenue Tools...');
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
    // In a real app, use a toast notification
    console.log('Success:', message);
    // You can implement a toast service here
  }

  // ===== Form Getters for Template =====
  get name() { return this.planForm.get('name'); }
  get description() { return this.planForm.get('description'); }
  get strategy() { return this.planForm.get('strategy'); }
  get status() { return this.planForm.get('status'); }
  get features() { return this.planForm.get('features'); }
}