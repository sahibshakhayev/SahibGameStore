export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
  repeatPassword: string
}

export interface PaymentMethod {
  id: string
  userId: string
  payer: string
  email: { address: string; nonconformities: any[]; isInvalid: boolean; isValid: boolean }
  type: number
  cardHolderName: string
  cardNumber: number
  createdDate: string
  lastUpdated: string
  active: boolean
}
