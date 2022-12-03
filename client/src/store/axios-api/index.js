import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/api',
})

export const createPlaylist = (newListName, newSongs, userEmail) => {
    return api.post(`/playlist/`, {
        name: newListName,
        songs: newSongs,
        ownerEmail: userEmail
    })
}

export const deletePlaylistById = (id) => api.delete(`/playlist/${id}`)

export const getPlaylistById = (id) => api.get(`/playlist/${id}`)

export const getPlaylistPairs = () => api.get(`/playlistpairs/`)

export const updatePlaylistById = (id, playlist) => {
    return api.put(`/playlist/${id}`, {
        playlist : playlist
    })
}

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
}

export default apis