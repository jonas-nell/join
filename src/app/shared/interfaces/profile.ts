export interface Profile {
  id: string;
  created_at: string;
  user_name: string;
  user_email: string;
  // user_phone includes null because a user might not have entered a phone number.
  user_phone: string | null;
  user_role: string;
}