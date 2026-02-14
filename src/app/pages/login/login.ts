import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type UserRole = 'admin' | 'user';
type Language = 'English (US)' | 'Arabic (KSA)' | 'French (FR)';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('langMenu') langMenu!: ElementRef;

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;
  role: UserRole = 'admin';
  isRtl: boolean = false;
  isLangMenuOpen: boolean = false;

  currentLanguage: Language = 'English (US)';
  availableLanguages: Language[] = ['English (US)', 'Arabic (KSA)', 'French (FR)'];

  private translations: Translations = {
    'English (US)': {
      welcomeBack: 'Welcome Back',
      credentialsPrompt: 'Please enter your credentials to manage your units.',
      roleManager: 'Property Manager',
      roleStaff: 'Staff Member',
      emailLabel: 'Email Address',
      emailPlaceholder: 'name@hotel.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password?',
      signIn: 'Sign In',
      newTeamMember: 'New team member?',
      requestAccess: 'Request Access',
      contactSupport: 'Contact Support',
      heroTitle: 'Manage Your Hotel Units with Ease',
      heroSub: 'Access your residential units, rooms, and rates in one professional dashboard. Designed for hospitality excellence.',
      heroFooter: 'Trusted by 5,000+ establishments worldwide',
      systemName: 'H-Control Systems',
      management: 'Hotel Management'
    },
    'Arabic (KSA)': {
      welcomeBack: 'مرحباً بعودتك',
      credentialsPrompt: 'يرجى إدخال بيانات الاعتماد الخاصة بك لإدارة وحداتك.',
      roleManager: 'مدير العقار',
      roleStaff: 'موظف عمليات',
      emailLabel: 'عنوان البريد الإلكتروني',
      emailPlaceholder: 'name@hotel.com',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: '••••••••',
      rememberMe: 'تذكرني',
      forgotPassword: 'هل نسيت كلمة المرور؟',
      signIn: 'تسجيل الدخول',
      newTeamMember: 'عضو فريق جديد؟',
      requestAccess: 'طلب الوصول',
      contactSupport: 'اتصل بالدعم',
      heroTitle: 'إدارة وحداتك الفندقية بسهولة',
      heroSub: 'قم بالوصول إلى وحداتك السكنية وغرفك وأسعارك في لوحة تحكم احترافية واحدة. مصممة للتميز في الضيافة.',
      heroFooter: 'موثوق به من قبل أكثر من 5000 منشأة حول العالم',
      systemName: 'أنظمة أتش-كنترول',
      management: 'إدارة الفنادق'
    },
    'French (FR)': {
      welcomeBack: 'Bon retour',
      credentialsPrompt: 'Veuillez saisir vos identifiants pour gérer vos unités.',
      roleManager: 'Gestionnaire',
      roleStaff: 'Membre du personnel',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'nom@hotel.com',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: '••••••••',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié ?',
      signIn: 'Se connecter',
      newTeamMember: 'Nouveau membre ?',
      requestAccess: 'Demander l\'accès',
      contactSupport: 'Contacter le support',
      heroTitle: 'Gérez vos unités hôtelières avec facilité',
      heroSub: 'Accédez à vos unités résidentielles, chambres et tarifs dans un tableau de bord professionnel unique. Conçu pour l\'excellence hôtelière.',
      heroFooter: 'Utilisé par plus de 5 000 établissements dans le monde',
      systemName: 'Systèmes H-Control',
      management: 'Gestion Hôtelière'
    }
  };

  constructor(
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Load saved preferences
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    const savedEmail = localStorage.getItem('savedEmail');

    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }

    if (savedRememberMe && savedEmail) {
      this.rememberMe = true;
      this.email = savedEmail;
    }

    this.updateRtlStatus();
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
    this.setupClickOutsideListener();
  }

  private initializeAnimations(): void {
    // CSS animations are handled via CSS classes
    // GSAP animations would be implemented here if needed
  }

  private setupClickOutsideListener(): void {
    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (this.langMenu && !this.langMenu.nativeElement.contains(event.target)) {
        this.isLangMenuOpen = false;
      }
    });
  }

  private updateRtlStatus(): void {
    this.isRtl = this.currentLanguage === 'Arabic (KSA)';
    
    // Update document direction
    if (this.isRtl) {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = this.currentLanguage === 'French (FR)' ? 'fr' : 'en';
    }
  }

  // Form Submission
  onSubmit(event: Event): void {
    event.preventDefault();
    
    // Simple validation
    if (!this.email || !this.password) {
      alert(this.getTranslation('credentialsPrompt'));
      return;
    }

    // Save preferences if remember me is checked
    if (this.rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('savedEmail', this.email);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('savedEmail');
    }

    // Save language preference
    localStorage.setItem('preferred-language', this.currentLanguage);

    // Simulate login - In real app, you would call an API
    console.log('Login attempt:', { email: this.email, role: this.role });

    // Navigate to dashboard
    console.log('Navigating to dashboard...');
    this.router.navigate(['/app/dashboard']).then(
      success => console.log('Navigation successful:', success),
      error => console.error('Navigation failed:', error)
    );
  }

  // Role Management
  setRole(newRole: UserRole): void {
    this.role = newRole;
  }

  getRoleSelectorTransform(): string {
    if (this.role === 'user') {
      return this.isRtl ? 'translateX(0)' : 'translateX(100%)';
    } else {
      return this.isRtl ? 'translateX(-100%)' : 'translateX(0)';
    }
  }

  // Password Visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Language Management
  toggleLanguageMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  selectLanguage(lang: Language): void {
    this.currentLanguage = lang;
    this.isLangMenuOpen = false;
    this.updateRtlStatus();
  }

  // Translation Helper
  getTranslation(key: string): string {
    return this.translations[this.currentLanguage][key] || key;
  }

  // Support Contact
  handleSupportClick(): void {
    const message = this.currentLanguage === 'Arabic (KSA)' 
      ? 'جارٍ الاتصال بدعم جراند ستاي...\nفريقنا متاح على مدار الساعة طوال أيام الأسبعة لمساعدتك في الوصول.'
      : this.currentLanguage === 'French (FR)'
      ? 'Connexion au support Grand Stay...\nNotre équipe est disponible 24h/24 et 7j/7 pour vous aider avec votre accès.'
      : 'Connecting to Grand Stay Support...\nOur team is available 24/7 to assist with your access.';
    
    alert(message);
  }

  // Navigation Methods
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToRequestAccess(): void {
    this.router.navigate(['/request-access']);
  }

  // Utility Methods
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  // Handle Enter key press
  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const form = event.target.closest('form');
      if (form) {
        this.onSubmit(event as any);
      }
    }
  }
}