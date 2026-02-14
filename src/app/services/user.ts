import { Injectable, signal, effect } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  adminId: string;
  role: 'admin' | 'user';
  profileImage: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private profile$ = new BehaviorSubject<UserProfile>(
    JSON.parse(localStorage.getItem('userProfile') || 'null') || {
      firstName: 'Mo',
      lastName: 'Sabry',
      email: 'mo.sabry@grandstay-pro.com',
      phone: '+1 (555) 000-1234',
      jobTitle: 'Senior Inventory Manager',
      adminId: '#99281',
      role: 'admin',
      profileImage: 'https://picsum.photos/seed/mo/150/150'
    }
  );

  get profile() { return this.profile$.value; }

  updateProfile(updates: Partial<UserProfile>) {
    const newProfile = { ...this.profile, ...updates };
    this.profile$.next(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  }

  getProfile(): Observable<UserProfile> {
    return of(this.profile);
  }

  updateProfileMethod(profile: UserProfile): Observable<UserProfile> {
    this.updateProfile(profile);
    return of(profile);
  }

  uploadProfileImage(file: File): Observable<string> {
    // Simulate image upload - in real app, upload to server
    const imageUrl = `https://picsum.photos/seed/${Date.now()}/150/150`;
    return of(imageUrl);
  }

  logout() {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isLoggedIn');
  }

  deactivateAccount(): Observable<void> {
    // In a real app, you would call your API
    // return this.http.post<void>(`${this.apiUrl}/deactivate`, {});
    return of(void 0);
  }

  deleteAccount(): Observable<void> {
    // In a real app, you would call your API
    // return this.http.delete<void>(`${this.apiUrl}/delete-account`);
    return of(void 0);
  }

  requestPasswordReset(email: string): Observable<void> {
    // In a real app, you would call your API
    // return this.http.post<void>(`${this.apiUrl}/reset-password`, { email });
    console.log(`Password reset requested for email: ${email}`);
    return of(void 0);
  }
}
