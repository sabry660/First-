import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';

interface Notification {
  id: number;
  title: string;
  time: string;
  body: string;
  type: 'urgent' | 'info' | 'normal' | 'alert';
  icon: string;
  active?: boolean;
  status: string;
  priority: string;
  id_ref: string;
  date: string;
}

type FilterType = 'all' | 'unread' | 'urgent';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class Notifications implements OnInit, AfterViewInit {
  private initialNotifications: Notification[] = [
    { 
      id: 1, 
      title: 'Urgent: Low Inventory Warning', 
      time: '15 mins ago', 
      body: 'Only 2 Standard Rooms remaining for Oct 30 - Nov 1. Consider adjusting rates.', 
      type: 'urgent', 
      icon: 'report', 
      active: true,
      status: 'Unresolved',
      priority: 'URGENT',
      id_ref: 'NOT-8842-XJ',
      date: 'October 21, 2023 at 10:45 AM'
    },
    { 
      id: 2, 
      title: 'New Booking: Deluxe Suite 402', 
      time: '2 mins ago', 
      body: 'Guest: Sarah Jenkins • Check-in: Oct 24, 2023', 
      type: 'info', 
      icon: 'calendar_add_on', 
      active: true,
      status: 'Confirmed',
      priority: 'NORMAL',
      id_ref: 'NOT-8843-XY',
      date: 'October 21, 2023 at 10:55 AM'
    },
    { 
      id: 3, 
      title: 'Booking Cancelled: Unit 201', 
      time: '1 hour ago', 
      body: 'Guest: Michael Torres • Refund processed automatically.', 
      type: 'normal', 
      icon: 'event_busy',
      status: 'Processed',
      priority: 'NORMAL',
      id_ref: 'NOT-8844-XZ',
      date: 'October 21, 2023 at 09:12 AM'
    },
    { 
      id: 4, 
      title: 'System Maintenance Reminder', 
      time: '3 hours ago', 
      body: 'Scheduled downtime at 2:00 AM UTC for server optimization.', 
      type: 'alert', 
      icon: 'update',
      status: 'Scheduled',
      priority: 'HIGH',
      id_ref: 'NOT-8845-XA',
      date: 'October 21, 2023 at 07:30 AM'
    },
    { 
      id: 5, 
      title: 'Payment Successful', 
      time: '5 hours ago', 
      body: 'Payment of $1,250 received for booking #4521', 
      type: 'info', 
      icon: 'payments',
      status: 'Completed',
      priority: 'NORMAL',
      id_ref: 'NOT-8846-XB',
      date: 'October 21, 2023 at 05:15 AM'
    },
  ];

  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  selectedId: number | null = 1;
  currentFilter: FilterType = 'all';
  urgentCount: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.notifications = [...this.initialNotifications];
    this.updateFilteredNotifications();
    this.calculateUrgentCount();
    
    // Auto-select first notification if none selected
    if (this.selectedId === null && this.filteredNotifications.length > 0) {
      this.selectedId = this.filteredNotifications[0].id;
    }
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }


  private updateFilteredNotifications(): void {
    switch (this.currentFilter) {
      case 'all':
        this.filteredNotifications = [...this.notifications];
        break;
      case 'unread':
        this.filteredNotifications = this.notifications.filter(note => note.active);
        break;
      case 'urgent':
        this.filteredNotifications = this.notifications.filter(note => note.type === 'urgent');
        break;
      default:
        this.filteredNotifications = [...this.notifications];
    }
  }

  private calculateUrgentCount(): void {
    this.urgentCount = this.notifications.filter(note => note.type === 'urgent').length;
  }

  // Getter for selected notification
  get selectedNotification(): Notification | undefined {
    if (this.selectedId === null) return undefined;
    return this.notifications.find(note => note.id === this.selectedId);
  }

  // Methods
  selectNotification(id: number): void {
    this.selectedId = id;
    
    // Mark as read when selected
    const noteIndex = this.notifications.findIndex(note => note.id === id);
    if (noteIndex !== -1) {
      this.notifications[noteIndex].active = false;
    }
  }

  filterNotifications(filter: FilterType): void {
    this.currentFilter = filter;
    this.updateFilteredNotifications();
    
    // Auto-select first notification when filter changes
    if (this.filteredNotifications.length > 0) {
      this.selectedId = this.filteredNotifications[0].id;
    } else {
      this.selectedId = null;
    }
  }

  deleteNotification(): void {
    if (this.selectedId === null) return;

    const noteIndex = this.notifications.findIndex(note => note.id === this.selectedId);
    if (noteIndex !== -1) {
      this.notifications.splice(noteIndex, 1);
      this.updateFilteredNotifications();
      this.calculateUrgentCount();
      
      // Select next available notification
      if (this.filteredNotifications.length > 0) {
        this.selectedId = this.filteredNotifications[0].id;
      } else {
        this.selectedId = null;
      }
    }
  }

  archiveNotification(): void {
    // For demo purposes, archiving behaves like delete
    this.deleteNotification();
  }

  proceedWithRecommendation(): void {
    alert('Proceeding with recommendation... This would trigger the suggested action in a real application.');
    
    if (this.selectedId !== null) {
      const noteIndex = this.notifications.findIndex(note => note.id === this.selectedId);
      if (noteIndex !== -1 && this.notifications[noteIndex].type === 'urgent') {
        this.notifications[noteIndex].status = 'Resolved';
        this.notifications[noteIndex].active = false;
      }
    }
  }

  viewContextualData(): void {
    alert('Opening contextual data view... This would show relevant data and analytics in a real application.');
  }

  snoozeAlert(): void {
    if (this.selectedId !== null) {
      const note = this.notifications.find(n => n.id === this.selectedId);
      if (note) {
        alert(`Alert "${note.title}" has been snoozed for 1 hour.`);
        // In a real app, you would implement actual snooze logic
      }
    }
  }

  // Helper Methods for Template
  getNotificationIconClass(type: string): string {
    switch (type) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500';
      case 'info':
        return 'bg-primary/10 text-primary';
      case 'alert':
        return 'bg-amber-500/10 text-amber-500';
      default:
        return 'bg-slate-100 text-slate-400 dark:bg-slate-800';
    }
  }

  // Add new notification (for demo purposes)
  addDemoNotification(): void {
    const newId = this.notifications.length > 0 
      ? Math.max(...this.notifications.map(n => n.id)) + 1 
      : 1;
    
    const newNotification: Notification = {
      id: newId,
      title: 'New System Alert',
      time: 'Just now',
      body: 'This is a demo notification added via the component.',
      type: 'info',
      icon: 'notification_add',
      active: true,
      status: 'New',
      priority: 'NORMAL',
      id_ref: `NOT-${9000 + newId}-XD`,
      date: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' at ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    this.notifications.unshift(newNotification);
    this.updateFilteredNotifications();
    this.calculateUrgentCount();
    this.selectedId = newId;
  }

  // Mark all as read
  markAllAsRead(): void {
    this.notifications.forEach(note => {
      note.active = false;
    });
    this.updateFilteredNotifications();
  }

  // Clear all notifications
  clearAllNotifications(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notifications = [];
      this.filteredNotifications = [];
      this.selectedId = null;
      this.urgentCount = 0;
    }
  }

  private initializeAnimations(): void {
    // Page load animations using GSAP
    gsap.from('.page-title', { 
      opacity: 0, 
      y: -30, 
      duration: 0.6,
      ease: "power2.out"
    });

    gsap.from('.filters-section', { 
      opacity: 0, 
      scale: 0.95, 
      duration: 0.8, 
      delay: 0.2,
      ease: "back.out(1.7)"
    });

    gsap.from('.notifications-list', { 
      opacity: 0, 
      y: 50, 
      duration: 0.7, 
      delay: 0.4,
      ease: "power2.out"
    });
  }
}