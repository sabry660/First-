import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, UserProfile } from '../../services/user';
import { gsap } from 'gsap';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-settings.html',
  styleUrls: ['./profile-settings.css']
})
export class ProfileSettings implements OnInit, AfterViewInit {
  profile: UserProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@hotel.com',
    phone: '+966 50 123 4567',
    jobTitle: 'Hotel Administrator',
    adminId: 'ADM001',
    role: 'admin',
    profileImage: 'https://picsum.photos/seed/profile/150/150'
  };

  profileForm!: FormGroup;
  isSaving = false;
  showSuccess = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe(profile => {
      this.profile = profile;
      this.initForm();
    });
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: [this.profile.firstName, Validators.required],
      lastName: [this.profile.lastName, Validators.required],
      email: [this.profile.email, [Validators.required, Validators.email]],
      phone: [this.profile.phone || ''],
      jobTitle: [this.profile.jobTitle, Validators.required]
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

    gsap.from('.profile-card', { 
      opacity: 0, 
      scale: 0.9, 
      duration: 0.8, 
      delay: 0.2,
      ease: "back.out(1.7)"
    });

    gsap.from('.form-section', { 
      opacity: 0, 
      x: -50, 
      duration: 0.7, 
      delay: 0.4,
      ease: "power2.out"
    });

    gsap.from('.danger-zone', { 
      opacity: 0, 
      y: 50, 
      duration: 0.6, 
      delay: 0.6,
      ease: "power2.out"
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    const updatedProfile = { ...this.profile, ...this.profileForm.value };
    
    this.userService.updateProfileMethod(updatedProfile).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isSaving = false;
        this.showSuccess = true;
        if (this.profileForm.valid) {
          const formValue = this.profileForm.value;
          
          // Update profile data
          this.profile.firstName = formValue.firstName;
          this.profile.lastName = formValue.lastName;
          this.profile.email = formValue.email;
          this.profile.phone = formValue.phone;
          this.profile.jobTitle = formValue.jobTitle;
          
          // Save to localStorage
          localStorage.setItem('profile', JSON.stringify(this.profile));
          
          // Show success message
          this.showSuccess = true;
          setTimeout(() => {
            this.showSuccess = false;
          }, 2000);
        } else {
          this.markFormGroupTouched(this.profileForm);
        }
        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);
      },
      error: () => {
        this.isSaving = false;
        // Show error message
      }
    });
  }

  onImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.userService.uploadProfileImage(file).subscribe(imageUrl => {
        this.profile.profileImage = imageUrl;
      });
    }
  }

  triggerFileUpload(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  resetDefaultImage(): void {
    this.profile.profileImage = 'https://picsum.photos/seed/profile/150/150';
  }

  deactivateAccount(): void {
    if (confirm('Are you sure you want to deactivate your account? This action can be reversed.')) {
      this.userService.deactivateAccount().subscribe({
        next: () => {
          // Show success message and handle account deactivation
          console.log('Account deactivated successfully');
        },
        error: () => {
          // Show error message
          console.error('Failed to deactivate account');
        }
      });
    }
  }

  deleteAccount(): void {
    if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.')) {
      // Double confirmation for destructive action
      if (confirm('This is your final warning. All data will be permanently deleted. Continue?')) {
        this.userService.deleteAccount().subscribe({
          next: () => {
            // Show success message and handle account deletion
            console.log('Account deleted successfully');
            // Redirect to login or home page
          },
          error: () => {
            // Show error message
            console.error('Failed to delete account');
          }
        });
      }
    }
  }

  requestPasswordReset(): void {
    this.userService.requestPasswordReset(this.profile.email).subscribe({
      next: () => {
        // Show success message to user
        console.log('Password reset email sent successfully');
        alert('Password reset instructions have been sent to your email address.');
      },
      error: () => {
        // Show error message
        console.error('Failed to send password reset email');
        alert('Failed to send password reset email. Please try again later.');
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
