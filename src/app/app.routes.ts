import { Routes } from '@angular/router';
import { AppShell } from './app-shell';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login',
    pathMatch: 'full'
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login').then(m => m.Login) 
  },
  { 
    path: 'app', 
    component: AppShell,
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'calendar', loadComponent: () => import('./pages/calendar/calendar').then(m => m.Calendar) },
      { path: 'reservations', loadComponent: () => import('./pages/reservations/reservations').then(m => m.Reservations) },
      { path: 'analytics', loadComponent: () => import('./pages/analytics/analytics').then(m => m.AnalyticsComponent) },
      { path: 'bulk-updates', loadComponent: () => import('./pages/bulk-updates/bulk-updates').then(m => m.BulkUpdates) },
      { path: 'rates', loadComponent: () => import('./pages/rate-plans/rate-plans').then(m => m.RatePlans) },
      { path: 'staff', loadComponent: () => import('./pages/staff-management/staff-management').then(m => m.StaffManagement) },
      { path: 'promotions', loadComponent: () => import('./pages/promotions/promotions').then(m => m.Promotions) },
      { path: 'profile', loadComponent: () => import('./pages/profile-settings/profile-settings').then(m => m.ProfileSettings) },
      { path: 'settings', loadComponent: () => import('./pages/system-settings/system-settings').then(m => m.SystemSettings) },
      {path: 'notifications', loadComponent: () => import('./pages/notifications/notifications').then(m => m.Notifications) }
    ]
  },
  { path: '**', redirectTo: '/login' }
];


/*{ 
  path: 'staff', 
  canActivate: [AuthGuard], 
  loadComponent: () => import('./pages/staff-management/staff-management').then(m => m.StaffManagement) 
}*/