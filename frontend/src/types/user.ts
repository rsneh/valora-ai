export interface User {
  id: number;
  uid: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  allowed_to_contact?: boolean;
  time_created?: string;
  time_updated?: string;
}
