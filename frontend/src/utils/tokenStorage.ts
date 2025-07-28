export const saveAuthToStorage = (data: {
  accessToken: string
  refreshToken: string
  userName: string
  roles: string[]
}) => {
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  localStorage.setItem('userName', data.userName)
  localStorage.setItem('roles', JSON.stringify(data.roles))
}

export const clearAuthFromStorage = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userName')
  localStorage.removeItem('roles')
}
