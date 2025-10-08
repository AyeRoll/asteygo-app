export type TimestampLike = { toDate?: () => Date } | Date | number | string | null | undefined;

export type Category = {
  id?: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EventDoc = {
  id?: string;
  title: string;
  description?: string;
  address?: string;
  lat?: number;
  lon?: number;
  time?: string;
  price?: number | null;
  category?: string; // category id or name
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MapLocation = {
  id?: string;
  label: string;
  address?: string;
  lat: number;
  lon: number;
  type?: 'poi' | 'event' | 'hotel' | 'food' | 'gas' | 'ev' | 'custom';
  createdAt?: Date;
  updatedAt?: Date;
};

export type Group = {
  id?: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type Person = {
  id?: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ItineraryItem = {
  id?: string;
  group_id: string;
  user_id: string;
  description: string;
  scheduled_for?: string; // ISO/time string
  created_at?: Date;
};

export type Budget = {
  id?: string;
  group_id: string;
  currency?: string;
  total?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Expense = {
  id?: string;
  group_id: string;
  user_id: string;
  amount: number;
  currency?: string;
  category?: string; // e.g., food, lodging, transport
  note?: string;
  createdAt?: Date;
};
