import api from "@/lib/axios";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => {
    const res = await api.post(
      "/auth/signup",
      { username, password, email, firstName, lastName },
      { withCredentials: true },
    );

    return res.data;
  },

  signIn: async (username: string, password: string) => {
    const res = await api.post(
      "auth/signin",
      { username, password },
      { withCredentials: true },
    );
    return res.data; // access token
  },

  signOut: async () => {
    return api.post("/auth/signout", null, { withCredentials: true });
  },

  googleSignIn: async (credential: string) => {
    const res = await api.post(
      "/auth/google",
      { credential },
      { withCredentials: true },
    );
    return res.data;
  },

  fetchMe: async () => {
    const res = await api.get("/users/me", { withCredentials: true });
    return res.data.user;
  },

  refresh: async () => {
    const res = await api.post("/auth/refresh", { withCredentials: true });
    return res.data.accessToken;
  },
};
