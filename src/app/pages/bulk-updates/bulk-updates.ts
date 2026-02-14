import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';

type UpdateType = 'rate' | 'allotment' | 'status';

interface Room {
  name: string;
  count: number;
  icon: string;
  image: string;
}

@Component({
  selector: 'app-bulk-updates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-updates.html',
  styleUrls: ['./bulk-updates.css']
})
export class BulkUpdates implements OnInit, AfterViewInit {
  // Calendar selection state
  selectedStart: number | null = 5;
  selectedEnd: number | null = 20;
  selectedRooms: string[] = ['DELUXE KING', 'EXECUTIVE STUDIO'];

  // Parameter state
  updateType: UpdateType = 'rate';
  updateValue: string = '250';
  statusValue: 'Available' | 'Sold Out' | 'On Request' = 'Available';
  

  // Processing state
  isExecuting = false;
  progress = 0;
  showComplete = false;
  
  // Sidebar state
  isSidebarOpen = false;

  ngOnInit(): void {
    // Initialization logic if needed
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  roomsData: Room[] = [
    { name: 'DELUXE KING', count: 12, icon: 'king_bed', image: 'https://picsum.photos/seed/deluxe-king/400/300' },
    { name: 'STANDARD DOUBLE', count: 24, icon: 'bed', image: 'https://picsum.photos/seed/standard-double/400/300' },
    { name: 'EXECUTIVE STUDIO', count: 8, icon: 'apartment', image: 'https://picsum.photos/seed/executive-studio/400/300' },
    { name: 'FAMILY CONNECTOR', count: 4, icon: 'meeting_room', image: 'https://picsum.photos/seed/family-connector/400/300' },
  ];
  

  get calculateDays(): number {
    if (this.selectedStart === null || this.selectedEnd === null) return 0;
    return Math.max(0, (this.selectedEnd - this.selectedStart) + 1);
  }

  private initializeAnimations(): void {
    // Page load animations using GSAP
    gsap.from('.page-title', { 
      opacity: 0, 
      y: -30, 
      duration: 0.6,
      ease: "power2.out"
    });

    gsap.from('.rooms-grid', { 
      opacity: 0, 
      scale: 0.9, 
      duration: 0.8, 
      delay: 0.2,
      ease: "back.out(1.7)"
    });

    gsap.from('.calendar-section', { 
      opacity: 0, 
      x: -50, 
      duration: 0.7, 
      delay: 0.4,
      ease: "power2.out"
    });

    gsap.from('.update-form', { 
      opacity: 0, 
      y: 50, 
      duration: 0.6, 
      delay: 0.6,
      ease: "power2.out"
    });
  }

  handleDayClick(day: number) {
    if (this.selectedStart === null || (this.selectedStart !== null && this.selectedEnd !== null)) {
      this.selectedStart = day;
      this.selectedEnd = null;
    } else {
      if (day < this.selectedStart) {
        this.selectedStart = day;
        this.selectedEnd = null;
      } else {
        this.selectedEnd = day;
      }
    }
  }

  isInRange(day: number): boolean {
    if (this.selectedStart === null || this.selectedEnd === null) return false;
    return day >= this.selectedStart && day <= this.selectedEnd;
  }

  toggleRoom(name: string) {
    if (this.selectedRooms.includes(name)) {
      this.selectedRooms = this.selectedRooms.filter(r => r !== name);
    } else {
      this.selectedRooms.push(name);
    }
  }

  handleBulkUpdate() {
    if (!this.selectedStart || !this.selectedEnd || this.selectedRooms.length === 0) return;
    this.isExecuting = true;
    this.progress = 0;

    const interval = setInterval(() => {
      if (this.progress >= 100) {
        clearInterval(interval);
        this.isExecuting = false;
        this.showComplete = true;
        setTimeout(() => this.showComplete = false, 5000);
      } else {
        this.progress += 10;
      }
    }, 200);
  }

  // Parameter Buttons
  parameterTypes = [
    { id: 'rate', label: 'Pricing (SAR)', icon: 'payments' },
    { id: 'allotment', label: 'Allotment', icon: 'room_preferences' },
    { id: 'status', label: 'Open/Stop Sell', icon: 'block' }
  ];

  statusOptions = ['Available', 'Sold Out', 'On Request'];

  // Helper method to create array for calendar days
  getDaysArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i + 1);
  }

  // Type-safe methods for template assignments
  setUpdateType(typeId: string): void {
    this.updateType = typeId as UpdateType;
  }

  setStatusValue(status: string): void {
    this.statusValue = status as 'Available' | 'Sold Out' | 'On Request';
  }
  
  // Sidebar toggle method
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
