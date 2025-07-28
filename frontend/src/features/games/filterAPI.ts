import api from '../../api/axios'

export const fetchGenres = async () => (await api.get('/api/Genres')).data
export const fetchDevelopers = async () => (await api.get('/api/Companies')).data
export const fetchPlatforms = async () => (await api.get('/api/Platforms')).data
