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
  localStorage.removeItem('googleAuthResponse')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userName')
  localStorage.removeItem('roles')
}

export const getAuthFromStorage = () => {
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  const userName = localStorage.getItem('userName')
  const roles = localStorage.getItem('roles')

  if (!accessToken || !refreshToken || !userName || !roles) {
    return null
  }

  return {
    accessToken,
    refreshToken,
    userName,
    roles: JSON.parse(roles) as string[],
  }
}
