export type User = {
  id: string;
  email: string;
  name?: string;
};

export type AuthSession = {
  user: User | null;
  isLoading: boolean;
};

