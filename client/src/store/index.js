import { createContext, useContext, useState } from 'react'
import AuthContext from '../auth';
import api from './axios-api';
import jsTPS from '../common/jsTPS'
import CreateSong_Transaction from '../transactions/CreateSong_Transaction'
import MoveSong_Transaction from '../transactions/MoveSong_Transaction'
import RemoveSong_Transaction from '../transactions/RemoveSong_Transaction'
import UpdateSong_Transaction from '../transactions/UpdateSong_Transaction'

export const GlobalStoreContext = createContext();

export const ViewTypes = {
    HOME: 0,
    ALL: 1,
    USER: 2
}

export const SortTypes = {
    NAME: {name: 1},
    DATE: {publishedDate: -1},
    LISTENS: {listens: -1},
    LIKES: {numLikes: -1},
    DISLIKES: {numDislikes: -1}
}

const tps = new jsTPS();

function GlobalStoreContextProvider(props) {
    const { auth } = useContext(AuthContext);
    const [store, setStore] = useState({
        currentView: ViewTypes.ALL,
        currentQuery: '',
        loadedPlaylists: [],
        openedPlaylist: null,
        sortType: SortTypes.NAME
    });

    store.goToHomeView = async () => {
        setStore({
            ...store,
            currentView: ViewTypes.HOME,
            currentQuery: '',
            loadedPlaylists: await store.getOwnedLists(),
            openedPlaylist: null
        })
    }

    store.goToAllView = async () => {
        setStore({
            ...store,
            currentView: ViewTypes.ALL,
            currentQuery: '',
            loadedPlaylists: [],
            openedPlaylist: null
        })
    }

    store.goToUserView = async () => {
        setStore({
            ...store,
            currentView: ViewTypes.USER,
            currentQuery: '',
            loadedPlaylists: [],
            openedPlaylist: null
        })
    }

    store.goToUser = async (username) => {
        const response = await api.getPlaylists({published: true, ownerUsername: username})
        if(response.status === 200) {
            setStore({
                ...store,
                currentView: ViewTypes.USER,
                currentQuery: username,
                loadedPlaylists: response.data.playlists,
                openedPlaylist: null
            })
        }
    }

    store.setCurrentQuery = (newQuery) => {
        setStore({
            ...store,
            currentQuery: newQuery
        })
    }

    store.setNameSort = () => {
        // setStore({
        //     ...store,
        //     sortType: SortTypes.NAME
        // })
        store.searchLists(store.currentQuery, SortTypes.NAME)
    }

    store.setDateSort = () => {
        // setStore({
        //     ...store,
        //     sortType: SortTypes.DATE
        // })
        store.searchLists(store.currentQuery, SortTypes.DATE)
    }

    store.setListenSort = () => {
        // setStore({
        //     ...store,
        //     sortType: SortTypes.LISTENS
        // })
        store.searchLists(store.currentQuery, SortTypes.LISTENS)
    }

    store.setLikeSort = () => {
        // setStore({
        //     ...store,
        //     sortType: SortTypes.LIKES
        // })
        store.searchLists(store.currentQuery, SortTypes.LIKES)
    }
    
    store.setDislikeSort = () => {
        // setStore({
        //     ...store,
        //     sortType: SortTypes.DISLIKES
        // })
        store.searchLists(store.currentQuery, SortTypes.DISLIKES)
    }

    store.setOpenedPlaylist = async (playlist) => {        
        setStore({
            ...store,
            openedPlaylist: playlist
        })
        tps.clearAllTransactions();
    }

    store.updateList = async (newPlaylist) => {
        const response = await api.updatePlaylistById(newPlaylist._id, newPlaylist);
        if(response.status === 200) {
            return response.data.playlist;
        }
    }

    store.renameList = async (playlist, newName) => {
        const response = await api.renamePlaylistById(playlist._id, newName);
        console.log(response);
        if(response.status === 200) {
            return response.data.newName;
        }
    }

    store.toggleLikeList = async (playlist) => {
        await api.likePlaylistById(playlist._id, auth.user.username);
        if(store.sortType == SortTypes.LIKES || store.sortType == SortTypes.DISLIKES) {
            store.searchLists(store.currentQuery, store.sortType);
        }
    }

    store.toggleDislikeList = async (playlist) => {
        await api.dislikePlaylistById(playlist._id, auth.user.username);
        if(store.sortType == SortTypes.LIKES || store.sortType == SortTypes.DISLIKES) {
            store.searchLists(store.currentQuery, store.sortType);
        }
    }

    store.commentOnList = async (playlist, comment) => {
        await api.commentOnPlaylistById(playlist._id, comment);
    }

    store.listenToList = async (playlist) => {
        await api.listenToPlaylistById(playlist._id);
        if(store.sortType == SortTypes.LISTENS) {
            store.searchLists(store.currentQuery, store.sortType);
        }
    }

    store.deleteList = (playlistId) => {
        let index = 0;
        for(index; index < store.loadedPlaylists.length; index++) {
            if(store.loadedPlaylists[index]._id === playlistId) {
                break;
            }
        }
        console.log(index);
        let updatedLoadedPlaylists = store.loadedPlaylists;
        updatedLoadedPlaylists.splice(index, 1);
        console.log(updatedLoadedPlaylists);

        if(store.openedPlaylist && store.openedPlaylist._id === playlistId) {
            setStore({
                ...store,
                openedPlaylist: null,
                loadedPlaylists: updatedLoadedPlaylists
            })
        }
        else {
            setStore({
                ...store,
                loadedPlaylists: updatedLoadedPlaylists
            })
        }
        api.deletePlaylistById(playlistId)
    }

    store.createNewList = async () => {
        const response = await api.createList({
            name: 'Untitled',
            songs: [],
            ownerEmail: auth.user.email,
            ownerUsername: auth.user.username,
            published: false,
            likes: [],
            dislikes: [],
            comments: []
        });
        if(response.status === 200) {
            setStore({
                ...store,
                loadedPlaylists: await store.getOwnedLists()
            })
        }
    }

    store.cloneList = async (playlist) => {
        const response = await api.createList({
            name: playlist.name,
            songs: playlist.songs,
            ownerEmail: auth.user.email,
            ownerUsername: auth.user.username,
            published: false,
            likes: [],
            dislikes: []
        })
        if(response.status === 200) {
            if(store.currentView === ViewTypes.HOME) {
                setStore({
                    ...store,
                    loadedPlaylists: await store.getOwnedLists()
                })
            }
        }
    }

    store.getOwnedLists = async () => {
        const response = await api.getPlaylists({ownerEmail: auth.user.email}, store.sortType)
        if(response.status === 200) {
            return response.data.playlists
        }
    }

    store.searchLists = async (query, sort) => {
        let response = null;
        if(!sort) {
            sort = store.sortType;
        }
        switch(store.currentView) {
            case ViewTypes.HOME: {
                let q = query;
                if(query === '') {
                    q = { };
                }
                response = await api.getPlaylists({ownerEmail: auth.user.email, name: q}, sort);
                break;
            }
            case ViewTypes.ALL: {
                if(query !== '') {
                    response = await api.getPlaylists({published: true, name: query}, sort);
                }
                break;
            }
            case ViewTypes.USER: {
                if(query !== '') {
                    response = await api.getPlaylists({published: true, ownerUsername: query}, sort);
                }
                break;
            }
        }

        if(response.status === 200) {
            setStore({
                ...store,
                currentQuery: query,
                sortType: sort,
                loadedPlaylists: response.data.playlists
            });
            return response.data.playlists;
        }
    }

    store.removeSong = (index) => {
        let updatedPlaylist = store.openedPlaylist;
        updatedPlaylist.songs.splice(index, 1);
        setStore({
            ...store,
            openedPlaylist: updatedPlaylist
        });
    }

    store.createSong = (index, song) => {
        let updatedPlaylist = store.openedPlaylist;
        updatedPlaylist.songs.splice(index, 0, song);
        setStore({
            ...store,
            openedPlaylist: updatedPlaylist    
        });
    }

    store.updateSong = (index, newSong) => {
        let updatedPlaylist = store.openedPlaylist;
        updatedPlaylist.songs.splice(index, 1, newSong);
        setStore({
            ...store,
            openedPlaylist: updatedPlaylist
        });
    }

    store.moveSong = (oldIndex, newIndex) => {
        if(oldIndex === newIndex) return;
        let updatedPlaylist = store.openedPlaylist;
        
        let songToMove = {
            title: updatedPlaylist.songs[oldIndex].title,
            artist: updatedPlaylist.songs[oldIndex].artist,
            youTubeId: updatedPlaylist.songs[oldIndex].youTubeId
        }
        
        if(oldIndex < newIndex) {
            updatedPlaylist.songs.splice(newIndex+1, 0, songToMove);
            updatedPlaylist.songs.splice(oldIndex, 1);
        }
        else if(oldIndex > newIndex) {
            updatedPlaylist.songs.splice(newIndex, 0, songToMove);
            updatedPlaylist.songs.splice(oldIndex+1, 1);
        }

        setStore({
            ...store,
            openedPlaylist: updatedPlaylist
        });
    }

    store.addCreateSongTransaction = () => {
        let transaction = new CreateSong_Transaction(
            store, 
            store.openedPlaylist.songs.length, 
            {
                title: 'Untitled', 
                artist:'?', 
                youTubeId:'dQw4w9WgXcQ'
            }
        );
        tps.addTransaction(transaction);
    }

    store.addRemoveSongTransaction = (index, song) => {
        let transaction = new RemoveSong_Transaction(store, index, song)
        tps.addTransaction(transaction);
    }

    store.addUpdateSongTransaction = (index, oldSong, newSong) => {
        let transaction = new UpdateSong_Transaction(store, index, oldSong, newSong);
        tps.addTransaction(transaction);
    }

    store.addMoveSongTransaction = (oldIndex, newIndex) => {
        let transaction = new MoveSong_Transaction(store, oldIndex, newIndex)
        tps.addTransaction(transaction);
    }

    store.canUndo = () => {
        return tps.hasTransactionToUndo();
    }

    store.undo = () => {
        tps.undoTransaction();
    }

    store.canRedo = () => {
        return tps.hasTransactionToRedo();
    }

    store.redo = () => {
        tps.doTransaction();
    }

    return (
        <GlobalStoreContext.Provider value={{store}}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };