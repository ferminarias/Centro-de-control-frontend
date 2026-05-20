import prodeClient from "./prodeClient"

export interface ProdeUser {
  id: string
  email: string
  nombre: string
  apellido: string
  activo: boolean
  created_at: string
}

export interface ProdeLoginResponse {
  access_token: string
  token_type: string
  user: ProdeUser
}

export const prodeLogin = async (email: string, password: string): Promise<ProdeLoginResponse> => {
  const { data } = await prodeClient.post<ProdeLoginResponse>("/api/prode/auth/login", {
    email,
    password,
  })
  return data
}

export const prodeMe = async (): Promise<ProdeUser> => {
  const { data } = await prodeClient.get<ProdeUser>("/api/prode/auth/me")
  return data
}
