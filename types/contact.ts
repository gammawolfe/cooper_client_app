import { User } from '@/services/api.auth.service';

export interface IContact {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  image?: string;
  isRegistered: boolean;
  registeredUserId?: string;
  registeredUser?: User;
}

export interface IDeviceContact {
  id: string;
  name: string;
  phoneNumbers?: Array<{ number: string }>;
  emails?: Array<{ email: string }>;
  image?: string;
}