export interface Reservation {
  id: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  price: number;
  paymentMethod?: string;
}

export interface Metric {
  label: string;
  value: string;
  trend: string;
  icon: string;
  color: string;
}

export interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: string;
  colorClass: string;
  description?: string;
  progress?: number;
}

export interface RatePlan {
  id: string;
  name: string;
  description: string;
  status: string;
  strategy: string;
  icon: string;
  color: string;
  features: string[];
}
