import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService } from './services/language';
import { UserService } from './services/user';
import { Router } from '@angular/router';
import gsap from 'gsap';

@Component({
  selector: 'app-shell',
  standalone: true,
  templateUrl: './app-shell.html',
  styleUrls: ['./app-shell.css'],
  imports: [RouterOutlet, RouterLink, CommonModule]
})
export class AppShell implements AfterViewInit {
  @ViewChild('sidebar') sidebarRef!: ElementRef<HTMLDivElement>;

  isSidebarOpen = true;
  isDarkMode = false;

  constructor(public lang: LanguageService, public user: UserService, private router: Router) {
    // Initialize light mode as default
    this.initializeTheme();
  }

  ngAfterViewInit() {
    this.animateSidebar();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.animateSidebar();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.updateTheme();
  }

  private initializeTheme() {
    // Ensure light mode is default on app load
    this.isDarkMode = false;
    this.updateTheme();
  }

  private updateTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleLanguage() {
    this.lang.setLanguage(this.lang.language === 'en' ? 'ar' : 'en');
    this.animateSidebar(); // Sidebar animation adjusts for RTL
  }

  navigateToProfile() {
    this.router.navigate(['/app/profile']);
  }

  signOut() {
    this.router.navigate(['/login']);
  }

  private animateSidebar() {
    if (!this.sidebarRef) return;
    const x = this.isSidebarOpen ? '0%' : this.lang.isRtl ? '100%' : '-100%';
    const opacity = this.isSidebarOpen ? 1 : 0;
    gsap.to(this.sidebarRef.nativeElement, { x, opacity, duration: 0.4, ease: this.isSidebarOpen ? 'power3.out' : 'power3.in' });
  }

  get profile() { return this.user.profile; }
  get isAdmin() { return this.profile.role === 'admin'; }
  get t() { return this.lang.t; }
}
