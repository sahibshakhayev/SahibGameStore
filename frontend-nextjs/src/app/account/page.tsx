'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Lock, CreditCard, Trash2, Plus, Edit, Eye, EyeOff, Save } from 'lucide-react'
import {
  changePassword,
  fetchPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
} from '../../features/account/accountAPI'
import { type PaymentMethod, type ChangePasswordDto } from '../../features/account/types'

// UI Components (you'll need to add these to your components/ui folder)
const Button = ({ children, className = '', disabled = false, variant = 'default', size = 'default', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
  }
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3'
  }
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
)

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

const Label = ({ children, className = '', ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
)

const Select = ({ children, value, onValueChange, ...props }) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
  )
}

const Badge = ({ children, className = '', variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
  }
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  )
}

// Custom toast hook (simplified version)
const useToast = () => {
  return {
    toast: ({ title, description, variant }) => {
      // In a real app, you'd use a proper toast library
      if (variant === 'destructive') {
        alert(`${title}: ${description}`)
      } else {
        alert(`${title}: ${description}`)
      }
    }
  }
}

const AccountPage = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('security')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  

  // Fetch payment methods
  const { data: methods = [], isLoading, error } = useQuery<PaymentMethod[]>({
    queryKey: ['payments'],
    queryFn: fetchPaymentMethods
  })

  // Change password
  const [pwDto, setPwDto] = useState<ChangePasswordDto>({
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
  })
  
  const pwMutation = useMutation({
    mutationFn: () => changePassword(pwDto),
    onSuccess: () => {
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully'
      })
      setPwDto({ oldPassword: '', newPassword: '', repeatPassword: '' })
      setShowChangePassword(false)
    },
    onError: (err: any) => {
      toast({
        title: 'Password Change Failed',
        description: err.response?.data || 'Change failed.',
        variant: 'destructive'
      })
    },
  })

  // Add payment method
  const [newPm, setNewPm] = useState({
    payer: '',
    email: '',
    type: 0,
    cardHolderName: '',
    cardNumber: 0,
  })
  
  const addMutation = useMutation({
    mutationFn: () => addPaymentMethod(newPm),
    onSuccess: () => {
      toast({
        title: 'Payment Method Added',
        description: 'New payment method has been added successfully'
      })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      // Reset form
      setNewPm({
        payer: '',
        email: '',
        type: 0,
        cardHolderName: '',
        cardNumber: 0,
      })
    },
    onError: () => {
      toast({
        title: 'Add Payment Failed',
        description: 'Failed to add payment method',
        variant: 'destructive'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      toast({
        title: 'Payment Method Removed',
        description: 'Payment method has been removed successfully'
      })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: () => {
      toast({
        title: 'Remove Payment Failed',
        description: 'Failed to remove payment method',
        variant: 'destructive'
      })
    }
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwDto(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pwDto.newPassword !== pwDto.repeatPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    pwMutation.mutate()
  }

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    addMutation.mutate()
  }

  const handleRemovePaymentMethod = (id: number) => {
    deleteMutation.mutate(id)
  }

  const tabs = [
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard }
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
            <p className="text-gray-400">Manage your account preferences and security settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              

              {/* Security Tab */}
              {activeTab === 'security' && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Lock className="h-5 w-5" />
                      <span>Security Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Password</h3>
                        <p className="text-gray-400 text-sm">Last changed 30 days ago</p>
                      </div>
                      <Button
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        variant="outline"
                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>

                    {showChangePassword && (
                      <form onSubmit={handleChangePassword} className="space-y-4 pt-4 border-t border-gray-700">
                        <div>
                          <Label className="text-gray-300">Current Password</Label>
                          <div className="relative mt-1">
                            <Input
                              name="oldPassword"
                              type={showPasswords.current ? 'text' : 'password'}
                              value={pwDto.oldPassword}
                              onChange={handlePasswordChange}
                              className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                            >
                              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-300">New Password</Label>
                          <div className="relative mt-1">
                            <Input
                              name="newPassword"
                              type={showPasswords.new ? 'text' : 'password'}
                              value={pwDto.newPassword}
                              onChange={handlePasswordChange}
                              className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                            >
                              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-300">Confirm New Password</Label>
                          <div className="relative mt-1">
                            <Input
                              name="repeatPassword"
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={pwDto.repeatPassword}
                              onChange={handlePasswordChange}
                              className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                            >
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <Button 
                            type="submit" 
                            className="bg-cyan-600 hover:bg-cyan-700 text-white"
                            disabled={pwMutation.isPending}
                          >
                            {pwMutation.isPending ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                              </span>
                            ) : (
                              'Update Password'
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowChangePassword(false)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Payment Methods</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                      ) : error ? (
                        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-400 font-medium">Error loading payment methods</p>
                          </div>
                        </div>
                      ) : methods.length === 0 ? (
                        <div className="text-center py-12">
                          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-white mb-2">No payment methods</h3>
                          <p className="text-gray-400">Add your first payment method to get started</p>
                        </div>
                      ) : (
                        methods.map((method: PaymentMethod) => (
                          <div key={method.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-cyan-600/20 rounded-lg">
                                <CreditCard className="h-5 w-5 text-cyan-400" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-white font-medium">{method.cardHolderName}</span>
                                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                    Type {method.type}
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm">
                                  •••• •••• •••• {String(method.cardNumber).slice(-4)}
                                </p>
                                <p className="text-gray-400 text-sm">{method.payer}</p>
                                <p className="text-gray-400 text-sm">{method.email.address}</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRemovePaymentMethod(method.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>Add New Payment Method</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Payment Type</Label>
                          <Select
                            value={newPm.type.toString()}
                            onValueChange={(value) => setNewPm(prev => ({ ...prev, type: parseInt(value) }))}
                            className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                          >
                            <option value="0">Visa</option>
                            <option value="1">Mastercard</option>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300">Card Holder Name</Label>
                            <Input
                              value={newPm.cardHolderName}
                              onChange={(e) => setNewPm(prev => ({ ...prev, cardHolderName: e.target.value }))}
                              className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                              required
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Payer Name</Label>
                            <Input
                              value={newPm.payer}
                              onChange={(e) => setNewPm(prev => ({ ...prev, payer: e.target.value }))}
                              className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-gray-300">Email</Label>
                          <Input
                            type="email"
                            value={newPm.email}
                            onChange={(e) => setNewPm(prev => ({ ...prev, email: e.target.value }))}
                            className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                            required
                          />
                        </div>

                        <div>
                          <Label className="text-gray-300">Card Number</Label>
                          <Input
                            value={newPm.cardNumber || ''}
                            onChange={(e) => setNewPm(prev => ({ ...prev, cardNumber: Number(e.target.value.replace(/\D/g, '')) }))}
                            placeholder="1234 5678 9012 3456"
                            className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                            required
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                          disabled={addMutation.isPending}
                        >
                          {addMutation.isPending ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </span>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Payment Method
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage