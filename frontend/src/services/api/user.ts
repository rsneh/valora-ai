import apiClient from './client';
import { User } from "@/types/user";

export const getMyUser = async (token: string): Promise<User> => {
  const response = await apiClient.get(`/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateMyUser = async (user: Partial<User>, token: string): Promise<User> => {
  const response = await apiClient.put(`/users/me/`, user, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createUser = async (user: Partial<User>, token: string): Promise<User> => {
  const response = await apiClient.post("/users/", user, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
