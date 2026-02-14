import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';

interface RoomInventory {
  id: string;
  name: string;
  type: string;
  data: Record<string, {
    allotment: number;
    rate: number;
    status: 'Available' | 'On Request' | 'Sold Out';
  }>;
}

interface EditingCell {
  roomId: string;
  dateKey: string;
  field: 'allotment' | 'rate';
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit, AfterViewInit {
  @ViewChild('editInput') editInput!: ElementRef<HTMLInputElement>;
  
  viewStartDate: Date = new Date(2026, 0, 26);
  rooms: RoomInventory[] = [];
  filteredRooms: RoomInventory[] = [];
  expandedRooms: Record<string, boolean> = { '543869516': true };
  searchTerm: string = '';
  editingCell: EditingCell | null = null;
  tempValue: string = '';
  
  timelineDates: Date[] = [];
  
  ngOnInit(): void {
    this.initializeDates();
    this.initializeRooms();
    this.updateFilteredRooms();
  }
  
  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

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

    gsap.from('.calendar-table', { 
      opacity: 0, 
      y: 50, 
      duration: 0.7, 
      delay: 0.4,
      ease: "power2.out"
    });
  }
  
  private initializeDates(): void {
    this.timelineDates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(this.viewStartDate);
      d.setDate(this.viewStartDate.getDate() + i);
      this.timelineDates.push(d);
    }
  }
  
  private initializeRooms(): void {
    this.rooms = [
      {
        id: '543869516',
        name: 'Deluxe Double Room',
        type: 'Standard',
        data: this.timelineDates.reduce((acc, date) => {
          const key = this.formatDateKey(date);
          acc[key] = { 
            allotment: Math.floor(Math.random() * 5), 
            rate: 150 + (date.getDay() % 6 === 0 ? 60 : 0),
            status: Math.random() > 0.8 ? 'On Request' : 'Available' as const
          };
          return acc;
        }, {} as Record<string, any>)
      },
      {
        id: '543869517',
        name: 'Deluxe Two Bedroom Suite',
        type: 'Suite',
        data: this.timelineDates.reduce((acc, date) => {
          const key = this.formatDateKey(date);
          acc[key] = { 
            allotment: 2, 
            rate: 450,
            status: 'Available' as const
          };
          return acc;
        }, {} as Record<string, any>)
      },
      {
        id: '543869518',
        name: 'Deluxe One Bedroom Suite',
        type: 'Suite',
        data: this.timelineDates.reduce((acc, date) => {
          const key = this.formatDateKey(date);
          acc[key] = { 
            allotment: 1, 
            rate: 300,
            status: 'Available' as const
          };
          return acc;
        }, {} as Record<string, any>)
      }
    ];
    
    this.updateFilteredRooms();
  }
  
  private updateFilteredRooms(): void {
    this.filteredRooms = this.rooms.filter(room =>
      room.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      room.id.includes(this.searchTerm)
    );
  }
  
  
  // Date Methods
  formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  getWeekday(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  getRangeLabel(): string {
    const end = this.timelineDates[this.timelineDates.length - 1];
    const startStr = this.viewStartDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endStr = end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    return `${startStr} - ${endStr}`;
  }
  
  // Navigation Methods
  handlePrevMonth(): void {
    const next = new Date(this.viewStartDate);
    next.setMonth(next.getMonth() - 1);
    this.viewStartDate = next;
    this.initializeDates();
    this.initializeRooms();
  }
  
  handleNextMonth(): void {
    const next = new Date(this.viewStartDate);
    next.setMonth(next.getMonth() + 1);
    this.viewStartDate = next;
    this.initializeDates();
    this.initializeRooms();
  }
  
  // Room Methods
  isRoomExpanded(roomId: string): boolean {
    return !!this.expandedRooms[roomId];
  }
  
  toggleExpand(roomId: string): void {
    this.expandedRooms[roomId] = !this.expandedRooms[roomId];
  }
  
  getRoomInfoClass(roomId: string): string {
    return this.isRoomExpanded(roomId) 
      ? 'bg-slate-50/50 dark:bg-slate-900' 
      : 'bg-white dark:bg-slate-900';
  }
  
  // Cell Methods
  getDateHeaderClass(date: Date): string {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseClass = 'flex w-20 sm:w-24 shrink-0 flex-col items-center justify-center py-4 border-r border-slate-100 dark:border-slate-800';
    return isWeekend ? `${baseClass} bg-indigo-50/50 dark:bg-indigo-900/10` : baseClass;
  }
  
  getStatusCellClass(room: RoomInventory, date: Date): string {
    const status = room.data[this.formatDateKey(date)]?.status ?? 'Available';
    let colorClass = '';
    
    switch (status) {
      case 'Available': colorClass = 'bg-emerald-500'; break;
      case 'On Request': colorClass = 'bg-amber-500'; break;
      case 'Sold Out': colorClass = 'bg-rose-500'; break;
    }
    
    return `${colorClass} h-full w-20 sm:w-24 shrink-0 border-r border-white/5 flex items-center justify-center`;
  }
  
  getStatusText(room: RoomInventory, date: Date): string {
    const status = room.data[this.formatDateKey(date)]?.status ?? 'Available';
    switch (status) {
      case 'Available': return 'Open';
      case 'On Request': return 'Req';
      case 'Sold Out': return 'Sold';
      default: return '';
    }
  }
  
  getAllotmentCellClass(room: RoomInventory, date: Date): string {
    const allotment = this.getAllotment(room, date);
    const baseClass = 'w-20 sm:w-24 shrink-0 py-3 flex flex-col items-center justify-center border-r border-slate-50 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group';
    
    if (allotment === 0) {
      return `${baseClass} bg-rose-50/30 dark:bg-rose-900/10`;
    }
    
    return baseClass;
  }
  
  getAllotment(room: RoomInventory, date: Date): number {
    return room.data[this.formatDateKey(date)]?.allotment ?? 2;
  }
  
  getRate(room: RoomInventory, date: Date): number {
    return room.data[this.formatDateKey(date)]?.rate ?? 250;
  }
  
  // Edit Methods
  startEdit(roomId: string, dateKey: string, field: 'allotment' | 'rate', currentVal: number): void {
    this.editingCell = { roomId, dateKey, field };
    this.tempValue = currentVal.toString();
    
    // Focus input after view update
    setTimeout(() => {
      if (this.editInput) {
        this.editInput.nativeElement.focus();
      }
    });
  }
  
  saveEdit(): void {
    if (!this.editingCell) return;
    
    const { roomId, dateKey, field } = this.editingCell;
    const val = parseInt(this.tempValue) || 0;
    
    this.rooms = this.rooms.map(room => {
      if (room.id !== roomId) return room;
      
      const existingData = room.data[dateKey] || { 
        allotment: 0, 
        rate: 0, 
        status: 'Available' as const 
      };
      
      return {
        ...room,
        data: {
          ...room.data,
          [dateKey]: {
            ...existingData,
            [field]: val
          }
        }
      };
    });
    
    this.updateFilteredRooms();
    this.editingCell = null;
    this.tempValue = '';
  }
  
  cancelEdit(): void {
    this.editingCell = null;
    this.tempValue = '';
  }
  
  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('bg-black/60')) {
      this.cancelEdit();
    }
  }
  
  // Search Methods
  onSearchChange(): void {
    this.updateFilteredRooms();
  }
}