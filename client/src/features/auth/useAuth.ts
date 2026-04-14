import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../lib/axios";
import type { User } from "../../types";

export function useAuth() {
  const { user, setUser } = useAuthStore();

  //Pattern is check /me for login, if 401 then interceptor clears store
  const { isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get<User>("/me");
      setUser(data);
      return data;
    },
    retry: false,
    staleTime: Infinity,
  });

  const logout = async () => {
    await api.post("/logout");
    setUser(null);
  };

  return { user, isLoading, logout };
}
