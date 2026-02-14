import { Component, signal, computed, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'SUPER ADMIN' | 'FRONT DESK' | 'SHIFT LEAD' | 'MANAGER' | 'HOUSEKEEPING';
  dept: string;
  status: 'Active' | 'Inactive';
  login: string;
}

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-management.html',
  styleUrls: ['./staff-management.css']
})
export class StaffManagement implements OnInit, AfterViewInit {
  // State using Signals
  staff = signal<StaffMember[]>([
    { id: '1', name: 'Jordan Smith', email: 'jordan.s@hotel.com', role: 'SUPER ADMIN', dept: 'Management', status: 'Active', login: '2 mins ago' },
    { id: '2', name: 'Elena Rodriguez', email: 'elena.r@hotel.com', role: 'FRONT DESK', dept: 'Guest Services', status: 'Active', login: 'Oct 24, 09:12 AM' },
    { id: '3', name: 'Marcus Chen', email: 'marcus.c@hotel.com', role: 'SHIFT LEAD', dept: 'Housekeeping', status: 'Inactive', login: 'Oct 22, 04:30 PM' },
    { id: '4', name: 'David Vance', email: 'd.vance@hotel.com', role: 'MANAGER', dept: 'Operations', status: 'Active', login: '1 hour ago' },
    { id: '5', name: 'Sarah Miller', email: 's.miller@hotel.com', role: 'FRONT DESK', dept: 'Guest Services', status: 'Active', login: '3 hours ago' },
    { id: '6', name: 'Robert King', email: 'r.king@hotel.com', role: 'HOUSEKEEPING', dept: 'Maintenance', status: 'Active', login: 'Yesterday' },
  ]);

  searchTerm = signal('');
  roleFilter = signal('All Roles');
  statusFilter = signal('All Statuses');
  isModalOpen = signal(false);
  currentPage = signal(1);
  itemsPerPage = 4;

  // New User Form State
  newName = '';
  newEmail = '';
  newRole: StaffMember['role'] = 'FRONT DESK';

  ngOnInit(): void {
    // Initialization logic if needed
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  // Computed: Replaces useMemo
  filteredStaff = computed(() => {
    return this.staff().filter(person => {
      const matchesSearch = person.name.toLowerCase().includes(this.searchTerm().toLowerCase()) || 
                           person.email.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchesRole = this.roleFilter() === 'All Roles' || person.role === this.roleFilter();
      const matchesStatus = this.statusFilter() === 'All Statuses' || person.status === this.statusFilter();
      return matchesSearch && matchesRole && matchesStatus;
    });
  });

  private initializeAnimations(): void {
    // Page load animations using GSAP
    gsap.from('.page-title', { 
      opacity: 0, 
      y: -30, 
      duration: 0.6,
      ease: "power2.out"
    });

    gsap.from('.search-section', { 
      opacity: 0, 
      scale: 0.95, 
      duration: 0.8, 
      delay: 0.2,
      ease: "back.out(1.7)"
    });

    gsap.from('.staff-table', { 
      opacity: 0, 
      y: 50, 
      duration: 0.7, 
      delay: 0.4,
      ease: "power2.out"
    });

    gsap.from('.pagination', { 
      opacity: 0, 
      y: 30, 
      duration: 0.5, 
      delay: 0.6,
      ease: "power2.out"
    });
  }

  paginatedStaff = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredStaff().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredStaff().length / this.itemsPerPage));

  // Methods
  setSearch(val: string) {
    this.searchTerm.set(val);
    this.currentPage.set(1);
  }

  setRole(val: string) {
    this.roleFilter.set(val);
    this.currentPage.set(1);
  }

  setStatus(val: string) {
    this.statusFilter.set(val);
    this.currentPage.set(1);
  }

  handleAddUser() {
    if (!this.newName || !this.newEmail) return;

    const newUser: StaffMember = {
      id: Date.now().toString(),
      name: this.newName,
      email: this.newEmail,
      role: this.newRole,
      dept: 'Operations',
      status: 'Active',
      login: 'Never',
    };

    this.staff.update(prev => [newUser, ...prev]);
    this.closeModal();
    this.currentPage.set(1);
  }

  openModal() { this.isModalOpen.set(true); }
  
  closeModal() {
    this.isModalOpen.set(false);
    this.newName = '';
    this.newEmail = '';
  }

  getRoleStyle(role: string) {
    return role === 'SUPER ADMIN' 
      ? 'bg-indigo-50 text-primary border-indigo-200' 
      : 'bg-slate-100 text-slate-500 border-transparent';
  }
}