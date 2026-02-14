import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { gsap } from 'gsap';

// ===== Interface Definitions =====
type TabType = 'general' | 'notifications' | 'integrations' | 'billing';

interface GeneralSetting {
  label: string;
  value: string;
  type: 'text' | 'email' | 'select' | 'textarea';
  options?: string[];
  fullWidth?: boolean;
}

interface NotificationSetting {
  title: string;
  description: string;
  enabled: boolean;
}

interface IntegrationSetting {
  name: string;
  icon: string;
  status: 'CONNECTED' | 'PAUSED' | 'DISCONNECTED';
  count: string;
  color: 'indigo' | 'orange' | 'rose' | 'slate';
}

interface BillingInvoice {
  id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

interface PriorityAlert {
  label: string;
  subtitle: string;
  active: boolean;
}

interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

interface SettingsData {
  general: GeneralSetting[];
  notifications: NotificationSetting[];
  integrations: IntegrationSetting[];
  billing: BillingInvoice[];
}

interface FilteredSettingsData extends SettingsData {}
// ===== End Interface Definitions =====

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './system-settings.html',
  styleUrls: ['./system-settings.css']
})
export class SystemSettings implements OnInit, AfterViewInit {
  // ===== UI State Properties =====
  activeTab: TabType = 'general';
  searchTerm: string = '';
  isSaving: boolean = false;
  showSuccess: boolean = false;

  // ===== Data Properties =====
  tabs: Tab[] = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
    { id: 'integrations', label: 'Integrations', icon: 'hub' },
    { id: 'billing', label: 'Billing & Plans', icon: 'payments' }
  ];

  priorityAlerts: PriorityAlert[] = [
    { label: 'Booking Confirmation', subtitle: 'Instant email and push', active: true },
    { label: 'Inventory Restock', subtitle: 'Alert when units return', active: true },
    { label: 'Failed Transaction', subtitle: 'Urgent mobile SMS alert', active: false }
  ];

  // ===== Form Properties =====
  settingsForm!: FormGroup;

  // ===== Mock Data =====
  private settingsData: SettingsData = {
    general: [
      { label: 'Hotel Name', value: 'Grand Stay Pro Premier', type: 'text' },
      { label: 'Primary Email', value: 'admin@grandstay.com', type: 'email' },
      { label: 'Phone Number', value: '+966 12 345 6789', type: 'text' },
      { 
        label: 'Timezone', 
        value: '(GMT+03:00) Riyadh', 
        type: 'select', 
        options: ['(GMT+03:00) Riyadh', '(GMT+00:00) London', '(GMT-05:00) NYC'] 
      },
      { 
        label: 'Full Address', 
        value: '123 Luxury Avenue, District 4, Riyadh, KSA', 
        type: 'textarea', 
        fullWidth: true 
      },
    ],
    notifications: [
      { title: 'Email Alerts', description: 'Send daily summary and urgent reports to primary email.', enabled: true },
      { title: 'SMS Notifications', description: 'Critical alerts delivered to property manager mobile.', enabled: false },
      { title: 'In-App Toasts', description: 'Show visual popups for new bookings in real-time.', enabled: true },
      { title: 'Browser Push', description: 'Desktop notifications when the tab is inactive.', enabled: false },
    ],
    integrations: [
      { name: 'Booking.com', icon: 'language', status: 'CONNECTED', count: '24 Units', color: 'indigo' },
      { name: 'Expedia Group', icon: 'flight_takeoff', status: 'CONNECTED', count: '18 Units', color: 'orange' },
      { name: 'Airbnb', icon: 'home', status: 'PAUSED', count: '10 Units', color: 'rose' },
      { name: 'TripAdvisor', icon: 'map', status: 'DISCONNECTED', count: '0 Units', color: 'slate' },
    ],
    billing: [
      { id: 'INV-001', date: 'Oct 01, 2024', amount: 'SAR 1,250.00', status: 'Paid' },
      { id: 'INV-002', date: 'Sep 01, 2024', amount: 'SAR 1,250.00', status: 'Paid' },
      { id: 'INV-003', date: 'Aug 01, 2024', amount: 'SAR 1,250.00', status: 'Paid' },
    ]
  };

  // ===== Computed Properties =====
  get filteredSettings(): FilteredSettingsData {
    if (!this.searchTerm.trim()) {
      return this.settingsData;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    
    return {
      general: this.settingsData.general.filter(item => 
        item.label.toLowerCase().includes(searchTermLower)
      ),
      notifications: this.settingsData.notifications.filter(item => 
        item.title.toLowerCase().includes(searchTermLower) || 
        item.description.toLowerCase().includes(searchTermLower)
      ),
      integrations: this.settingsData.integrations.filter(item => 
        item.name.toLowerCase().includes(searchTermLower)
      ),
      billing: this.settingsData.billing.filter(item => 
        item.id.toLowerCase().includes(searchTermLower)
      )
    };
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSettings();
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  // ===== Form Initialization =====
  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      hotelName: ['', [Validators.required, Validators.minLength(2)]],
      primaryEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      timezone: ['', [Validators.required]],
      fullAddress: ['', [Validators.required]]
    });

    // Load initial values
    this.loadFormValues();
  }

  private initializeAnimations(): void {
    // Page load animations using GSAP
    gsap.from('.page-title', { 
      opacity: 0, 
      y: -30, 
      duration: 0.6,
      ease: "power2.out"
    });

    gsap.from('.tabs-section', { 
      opacity: 0, 
      scale: 0.95, 
      duration: 0.8, 
      delay: 0.2,
      ease: "back.out(1.7)"
    });

    gsap.from('.settings-content', { 
      opacity: 0, 
      y: 50, 
      duration: 0.7, 
      delay: 0.4,
      ease: "power2.out"
    });
  }

  private loadFormValues(): void {
    const generalSettings = this.settingsData.general;
    
    this.settingsForm.patchValue({
      hotelName: generalSettings.find(s => s.label === 'Hotel Name')?.value || '',
      primaryEmail: generalSettings.find(s => s.label === 'Primary Email')?.value || '',
      phoneNumber: generalSettings.find(s => s.label === 'Phone Number')?.value || '',
      timezone: generalSettings.find(s => s.label === 'Timezone')?.value || '',
      fullAddress: generalSettings.find(s => s.label === 'Full Address')?.value || ''
    });
  }

  // ===== Data Loading =====
  private loadSettings(): void {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      this.settingsData = JSON.parse(savedSettings);
      this.loadFormValues();
    }
  }

  // ===== Tab Methods =====
  setActiveTab(tabId: TabType): void {
    this.activeTab = tabId;
  }

  isActiveTab(tabId: TabType): boolean {
    return this.activeTab === tabId;
  }

  getTabClass(tabId: TabType): string {
    const baseClasses = 'flex items-center gap-3 border-b-4 pb-6 font-black text-sm transition-all whitespace-nowrap';
    return this.isActiveTab(tabId) 
      ? `${baseClasses} border-primary text-primary` 
      : `${baseClasses} border-transparent text-slate-400 hover:text-slate-600`;
  }

  // ===== Save Methods =====
  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.markFormGroupTouched(this.settingsForm);
      return;
    }

    this.isSaving = true;

    // Update general settings from form
    const formValues = this.settingsForm.value;
    this.settingsData.general = this.settingsData.general.map(setting => {
      switch (setting.label) {
        case 'Hotel Name': return { ...setting, value: formValues.hotelName };
        case 'Primary Email': return { ...setting, value: formValues.primaryEmail };
        case 'Phone Number': return { ...setting, value: formValues.phoneNumber };
        case 'Timezone': return { ...setting, value: formValues.timezone };
        case 'Full Address': return { ...setting, value: formValues.fullAddress };
        default: return setting;
      }
    });

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('systemSettings', JSON.stringify(this.settingsData));
      this.isSaving = false;
      this.showSuccess = true;
      
      setTimeout(() => {
        this.showSuccess = false;
      }, 3000);
      
      alert('System configurations have been successfully saved and synced across all nodes.');
    }, 1200);
  }

  discardChanges(): void {
    if (confirm('Are you sure you want to discard all changes?')) {
      this.loadSettings();
      this.searchTerm = '';
    }
  }

  // ===== Notification Toggle =====
  toggleNotification(index: number): void {
    this.settingsData.notifications[index].enabled = !this.settingsData.notifications[index].enabled;
  }

  togglePriorityAlert(index: number): void {
    this.priorityAlerts[index].active = !this.priorityAlerts[index].active;
  }

  // ===== Helper Methods =====
  getIntegrationStatusClass(status: string): string {
    switch (status) {
      case 'CONNECTED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PAUSED': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'DISCONNECTED': return 'bg-slate-50 text-slate-400 border-slate-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  }

  getIntegrationIconClass(color: string): string {
    switch (color) {
      case 'indigo': return 'bg-indigo-50 text-indigo-600';
      case 'orange': return 'bg-orange-50 text-orange-600';
      case 'rose': return 'bg-rose-50 text-rose-600';
      default: return 'bg-slate-100 text-slate-400';
    }
  }

  getInvoiceStatusClass(status: string): string {
    switch (status) {
      case 'Paid': return 'text-emerald-500';
      case 'Pending': return 'text-amber-500';
      case 'Failed': return 'text-red-500';
      default: return 'text-slate-400';
    }
  }

  getToggleClass(enabled: boolean): string {
    return enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700';
  }

  getToggleKnobClass(enabled: boolean): string {
    return `absolute top-1 size-5 bg-white rounded-full transition-all duration-300 shadow-sm ${enabled ? 'right-1' : 'left-1'}`;
  }

  getPriorityToggleKnobClass(enabled: boolean): string {
    return `absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 shadow-sm ${enabled ? 'right-1' : 'left-1'}`;
  }

  // ===== Support Methods =====
  openSupportTicket(): void {
    alert('Opening support ticket... Our team will contact you shortly.');
  }

  goToMarketplace(): void {
    alert('Redirecting to integrations marketplace...');
  }

  updatePaymentMethod(): void {
    alert('Opening payment method update form...');
  }

  // ===== Form Validation =====
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // ===== Search Methods =====
  onSearchChange(): void {
    // Filtering is handled by computed property
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  // ===== Keyboard Shortcuts =====
  @HostListener('document:keydown.control.s', ['$event'])
  handleSaveShortcut(event: Event): void {
    event.preventDefault();
    this.saveSettings();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event): void {
    this.clearSearch();
  }

  // ===== Current Plan Info =====
  getCurrentPlan(): any {
    return {
      name: 'Professional Enterprise',
      renewal: 'Nov 24, 2024',
      units: '50 Inventory Units Cap',
      features: [
        'Unlimited Reservations',
        'Advanced Analytics',
        'Priority Support',
        'Multi-property Management'
      ]
    };
  }

  // ===== Getters for Template =====
  get hotelName() { return this.settingsForm.get('hotelName'); }
  get primaryEmail() { return this.settingsForm.get('primaryEmail'); }
  get phoneNumber() { return this.settingsForm.get('phoneNumber'); }
  get timezone() { return this.settingsForm.get('timezone'); }
  get fullAddress() { return this.settingsForm.get('fullAddress'); }

  // ===== Success Message =====
  showSuccessMessage(): void {
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }
}