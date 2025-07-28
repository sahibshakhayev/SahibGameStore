import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  changePassword,
  fetchPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
} from '../features/account/accountAPI'
import { type PaymentMethod, type ChangePasswordDto } from '../features/account/types'

const AccountPage = () => {
  const queryClient = useQueryClient()
  
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
  const [pwMsg, setPwMsg] = useState<string>()
  const pwMutation = useMutation({
    mutationFn: () => changePassword(pwDto),
    onSuccess: () => setPwMsg('Password changed successfully!'),
    onError: (err: any) => setPwMsg(err.response?.data || 'Change failed.'),
  })

  // Add payment
  const [newPm, setNewPm] = useState({
    payer: '',
    email: '',
    type: 0,
    cardHolderName: '',
    cardNumber: 0,
  })
  const [newMsg, setNewMsg] = useState<string>()
  const addMutation = useMutation({
    mutationFn: () => addPaymentMethod(newPm),
    onSuccess: () => {
      setNewMsg('Payment method added.')
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
    onError: () => setNewMsg('Failed to add.')
  })

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })

  const handlePasswordSubmit = (e:any) => {
    e.preventDefault()
    if (pwDto.newPassword !== pwDto.repeatPassword) {
      return setPwMsg('Passwords do not match.')
    }
    pwMutation.mutate()
  }

  const handleAddPayment = (e:any) => {
    e.preventDefault()
    addMutation.mutate()
  }

  return (
    <div className="h-screen w-screen bg-gray-50 p-0 m-0">
      <div className="w-full h-full p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full max-h-[calc(100vh-100px)]">
          {/* Change Password Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                <p className="text-gray-600 text-sm">Update your account password for better security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={pwDto.oldPassword}
                  onChange={(e) => setPwDto({ ...pwDto, oldPassword: e.target.value })}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={pwDto.newPassword}
                  onChange={(e) => setPwDto({ ...pwDto, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={pwDto.repeatPassword}
                  onChange={(e) => setPwDto({ ...pwDto, repeatPassword: e.target.value })}
                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {pwMsg && (
                <div className={`p-4 rounded-lg ${pwMsg.includes('successfully') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm font-medium ${pwMsg.includes('successfully') ? 'text-green-700' : 'text-red-700'}`}>
                    {pwMsg}
                  </p>
                </div>
              )}

              <button
                onClick={handlePasswordSubmit}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                disabled={pwMutation.isPending}
              >
                {pwMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Password...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6 overflow-hidden flex flex-col">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
                <p className="text-gray-600 text-sm">Manage your saved payment methods</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 font-medium">Error loading payment methods</p>
                  </div>
                </div>
              ) : (
                <>
                  {methods.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                      <p className="text-gray-500">Add your first payment method to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      {methods.map((method: PaymentMethod) => (
                        <div key={method.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{method.cardHolderName}</h3>
                              </div>
                              <div className="ml-11 space-y-1">
                                <p className="text-gray-600 text-sm">
                                  <span className="font-medium">Payer:</span> {method.payer}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  <span className="font-medium">Email:</span> {method.email.address}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  <span className="font-medium">Card:</span> •••• •••• •••• {String(method.cardNumber).slice(-4)}
                                </p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Type {method.type}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteMutation.mutate(method.id)}
                              className="ml-4 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-sm"
                              disabled={deleteMutation.isPending}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Add New Payment Method */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Payment Method</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payer Name</label>
                    <input
                      type="text"
                      placeholder="Enter payer name"
                      value={newPm.payer}
                      onChange={(e) => setNewPm({ ...newPm, payer: e.target.value })}
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={newPm.email}
                      onChange={(e) => setNewPm({ ...newPm, email: e.target.value })}
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Card Holder Name</label>
                    <input
                      type="text"
                      placeholder="Enter card holder name"
                      value={newPm.cardHolderName}
                      onChange={(e) => setNewPm({ ...newPm, cardHolderName: e.target.value })}
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="Enter card number"
                      value={newPm.cardNumber || ''}
                      onChange={(e) => setNewPm({ ...newPm, cardNumber: Number(e.target.value.replace(/\D/g, '')) })}
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Card Type</label>
                    <select
                      value={newPm.type}
                      onChange={(e) => setNewPm({ ...newPm, type: Number(e.target.value) })}
                      className="w-full px-4 py-3 border  text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value={0}>Visa</option>
                      <option value={1}>Mastercard</option>
                    </select>
                  </div>

                  {newMsg && (
                    <div className={`p-4 rounded-lg ${newMsg.includes('added') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <p className={`text-sm font-medium ${newMsg.includes('added') ? 'text-green-700' : 'text-red-700'}`}>
                        {newMsg}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleAddPayment}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Payment Method...
                      </span>
                    ) : (
                      'Add Payment Method'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage