import api from '../../api/axios'
import { type ChangePasswordDto, type PaymentMethod } from './types'

export const changePassword = async (dto: ChangePasswordDto): Promise<void> => {
  await api.put('/api/Account/ChangePassword', dto)
}

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const res = await api.get<PaymentMethod[]>('/api/Account/PaymentMethods')
  return res.data
}

export const addPaymentMethod = async (data: {
  payer: string
  email: string
  type: number
  cardHolderName: string
  cardNumber: number
}): Promise<void> => {
  await api.post('/api/Account/PaymentMethod', data)
}

export const deletePaymentMethod = async (id: string): Promise<void> => {
  await api.delete(`/api/Account/PaymentMethodDelete/${id}`)
}


export const requestPasswordReset = async (email: { email: string }) => {
  await api.post('/api/Account/PasswordReset/send', email)
}

export const checkResetToken = async (params: { email: string; token: string }) => {
  const res = await api.get<boolean>('/api/Account/PasswordReset/check_token', {
    params,
  })
  return res.data 
}

export const resetPassword = async (body: {
  email: string
  token: string
  newPassword: string
  confirmPassword: string
}) => {
  await api.put('/api/Account/PasswordReset/reset', body)
}
