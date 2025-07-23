// src/pages/admin/ManageGamesPage.tsx
import React, { useState } from 'react';
import { AxiosError } from 'axios';
import {
  useGetApiGames,
  usePostApiGames,
  usePutApiGames,
  useDeleteApiGamesId,
  usePutApiGamesIdUploadthumbimage,
  useGetApiGenres,
  useGetApiPlatforms,
  useGetApiCompanies,
  getGetApiGamesQueryKey,
  getGetApiGamesIdQueryKey,
  getApiGames,
  postApiGames,
  putApiGames,
  deleteApiGamesId,
  putApiGamesIdUploadthumbimage // For its Awaited<ReturnType> and for type inference
} from '../../lib/api/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import type { // --- Ensure these are imported correctly from your api.ts ---
  AddOrUpdateGameDTO,
  GameListViewModel,
  GenreViewModel,
  PlatformViewModel,
  CompanyViewModel,
  PutApiGamesIdUploadthumbimageBody // <--- NEW: Import the generated body type
} from '../../types/api.ts';
import { useQueryClient } from '@tanstack/react-query';

const ManageGamesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingGame, setEditingGame] = useState<GameListViewModel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formInput, setFormInput] = useState<AddOrUpdateGameDTO>({
    name: '',
    description: '',
    shortDescription: '',
    gameDevelopers: [],
    gameGenres: [],
    gamePlatforms: [],
    releaseDate: new Date().toISOString().split('T')[0] + 'T00:00:00',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const getErrorMessage = (error: AxiosError | Error | null | undefined): string => {
    if (!error) return 'An unknown error occurred.';
    if (error instanceof AxiosError) {
      if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        return (error.response.data as { message: string }).message;
      }
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  };

  const { data: games, isLoading, isError, error: gamesError } = useGetApiGames<GameListViewModel[], AxiosError>(
    { PageNumber: 1, PageSize: 50 },
    { query: {} }
  );
  const { data: genres } = useGetApiGenres<GenreViewModel[], AxiosError>();
  const { data: platforms } = useGetApiPlatforms<PlatformViewModel[], AxiosError>();
  const { data: companies } = useGetApiCompanies<CompanyViewModel[], AxiosError>();

  const createGameMutation = usePostApiGames<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof postApiGames>>) => {
        queryClient.invalidateQueries({ queryKey: getGetApiGamesQueryKey() });
        alert('Game created successfully!');
        const newGameId = (data as any)?.id;
        if (imageFile && newGameId) {
          const formData = new FormData();
          formData.append('file', imageFile);
          // NEW: Cast formData to the specific generated type for the data property
          uploadImageMutation.mutate({ id: newGameId, data: formData as unknown as PutApiGamesIdUploadthumbimageBody });
        } else if (imageFile) {
             alert("Warning: Game created but could not upload image (API did not return new game ID).");
        }
        setShowForm(false);
        setFormInput({ name: '', description: '', shortDescription: '', gameDevelopers: [], gameGenres: [], gamePlatforms: [], releaseDate: new Date().toISOString().split('T')[0] + 'T00:00:00' });
        setImageFile(null);
      },
      onError: (err: AxiosError) => {
        console.error('Create game failed:', err);
        alert(`Failed to create game: ${getErrorMessage(err)}`);
      },
    },
  });

  const updateGameMutation = usePutApiGames<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof putApiGames>>) => {
        queryClient.invalidateQueries({ queryKey: getGetApiGamesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetApiGamesIdQueryKey(editingGame!.id!) });
        alert('Game updated successfully!');
        if (imageFile && editingGame?.id) {
          const formData = new FormData();
          formData.append('file', imageFile);
          // NEW: Cast formData to the specific generated type for the data property
          uploadImageMutation.mutate({ id: editingGame.id, data: formData as unknown as PutApiGamesIdUploadthumbimageBody });
        }
        setShowForm(false);
        setEditingGame(null);
        setFormInput({ name: '', description: '', shortDescription: '', gameDevelopers: [], gameGenres: [], gamePlatforms: [], releaseDate: new Date().toISOString().split('T')[0] + 'T00:00:00' });
        setImageFile(null);
      },
      onError: (err: AxiosError) => {
        console.error('Update game failed:', err);
        alert(`Failed to update game: ${getErrorMessage(err)}`);
      },
    },
  });

  const deleteGameMutation = useDeleteApiGamesId<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof deleteApiGamesId>>) => {
        queryClient.invalidateQueries({ queryKey: getGetApiGamesQueryKey() });
        alert('Game deleted successfully!');
      },
      onError: (err: AxiosError) => {
        console.error('Delete game failed:', err);
        alert(`Failed to delete game: ${getErrorMessage(err)}`);
      },
    },
  });

  const uploadImageMutation = usePutApiGamesIdUploadthumbimage<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof putApiGamesIdUploadthumbimage>>) => {
        queryClient.invalidateQueries({ queryKey: getGetApiGamesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetApiGamesIdQueryKey(editingGame!.id!) });
        alert('Image uploaded successfully!');
      },
      onError: (err: AxiosError) => {
        console.error('Image upload failed:', err);
        alert(`Failed to upload image: ${getErrorMessage(err)}`);
      },
    },
  });


  const handleEdit = (game: GameListViewModel) => {
    setEditingGame(game);
    setFormInput({
      id: game.id,
      name: game.name || '',
      description: game.shortDescription || '',
      releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().split('T')[0] + 'T00:00:00' : '',
      shortDescription: game.shortDescription || '',
      gameDevelopers: [],
      gameGenres: [],
      gamePlatforms: [],
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      deleteGameMutation.mutate({ id });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormInput((prev: AddOrUpdateGameDTO) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, field: 'gameDevelopers' | 'gameGenres' | 'gamePlatforms') => {
    const selectedIds = Array.from(e.target.selectedOptions).map(option => option.value);

    const mappedRelations = selectedIds.map(id => {
        if (field === 'gameDevelopers') return { developerId: id };
        if (field === 'gameGenres') return { genreId: id };
        if (field === 'gamePlatforms') return { platformId: id };
        return {};
    });

    setFormInput((prev: AddOrUpdateGameDTO) => ({ ...prev, [field]: mappedRelations as any[] }));
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const gameDataToSend: AddOrUpdateGameDTO = {
      ...formInput,
    };

    if (editingGame) {
      try {
        await updateGameMutation.mutateAsync({ data: gameDataToSend });
      } catch (err) {
        // Errors handled by onError in mutation
      }
    } else {
      try {
        const createResult: any = await createGameMutation.mutateAsync({ data: gameDataToSend });
        const newGameId = createResult?.id;
        if (imageFile && newGameId) {
          const formData = new FormData();
          formData.append('file', imageFile);
          // THIS IS THE CRUCIAL LINE FIX: Explicitly cast FormData to the expected body type
          await uploadImageMutation.mutateAsync({ id: newGameId, data: formData as unknown as PutApiGamesIdUploadthumbimageBody });
        } else if (imageFile) {
             alert("Warning: Game created but could not upload image (API did not return new game ID).");
        }
      } catch (err) {
        // Errors handled by onError in mutation
      }
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <AlertMessage type="error" message={`Error loading games: ${getErrorMessage(gamesError as AxiosError | Error | null)}`} />;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Games</h1>

      <button
        onClick={() => { setShowForm(!showForm); setEditingGame(null); setFormInput({ name: '', description: '', shortDescription: '', gameDevelopers: [], gameGenres: [], gamePlatforms: [], releaseDate: new Date().toISOString().split('T')[0] + 'T00:00:00' }); setImageFile(null); }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        {showForm ? 'Hide Form' : 'Add New Game'}
      </button>

      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-md shadow-inner">
          <h2 className="text-2xl font-semibold mb-4">{editingGame ? 'Edit Game' : 'Create New Game'}</h2>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input type="text" id="name" name="name" value={formInput.name || ''} onChange={handleFormChange} required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label htmlFor="releaseDate" className="block text-gray-700 text-sm font-bold mb-2">Release Date:</label>
              <input type="date" id="releaseDate" name="releaseDate" value={formInput.releaseDate?.split('T')[0] || ''} onChange={handleFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
              <textarea id="description" name="description" value={formInput.description || ''} onChange={handleFormChange} required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3}></textarea>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="shortDescription" className="block text-gray-700 text-sm font-bold mb-2">Short Description:</label>
              <textarea id="shortDescription" name="shortDescription" value={formInput.shortDescription || ''} onChange={handleFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={2}></textarea>
            </div>
            <div>
              <label htmlFor="genres" className="block text-gray-700 text-sm font-bold mb-2">Genres:</label>
              <select multiple id="genres" name="genres" onChange={(e) => handleMultiSelectChange(e, 'gameGenres')}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32">
                {genres?.map((genre: GenreViewModel) => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="platforms" className="block text-gray-700 text-sm font-bold mb-2">Platforms:</label>
              <select multiple id="platforms" name="platforms" onChange={(e) => handleMultiSelectChange(e, 'gamePlatforms')}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32">
                {platforms?.map((platform: PlatformViewModel) => (
                  <option key={platform.id} value={platform.id}>{platform.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="developers" className="block text-gray-700 text-sm font-bold mb-2">Developers:</label>
              <select multiple id="developers" name="developers" onChange={(e) => handleMultiSelectChange(e, 'gameDevelopers')}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32">
                {companies?.map((company: CompanyViewModel) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">Cover/Thumbnail Image:</label>
              <input type="file" id="image" name="image" onChange={handleImageChange} accept="image/*"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              {editingGame?.coverImageRelativePath && <p className="text-sm text-gray-500 mt-2">Current Image: <a href={editingGame.coverImageRelativePath} target="_blank" rel="noopener noreferrer" className="text-blue-500">View</a></p>}
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                disabled={createGameMutation.isPending || updateGameMutation.isPending || uploadImageMutation.isPending}
              >
                {editingGame ? (updateGameMutation.isPending ? 'Updating...' : 'Update Game') : (createGameMutation.isPending ? 'Creating...' : 'Create Game')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingGame(null); setFormInput({ name: '', description: '', shortDescription: '', gameDevelopers: [], gameGenres: [], gamePlatforms: [], releaseDate: new Date().toISOString().split('T')[0] + 'T00:00:00' }); setImageFile(null); }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Games Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {games?.map((game: GameListViewModel) => (
              <tr key={game.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {game.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${game.price?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {game.availableQuantity} / { (game as any).totalQuantity ?? 'N/A' }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(game)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(game.id!)}
                    className="text-red-600 hover:text-red-900"
                    disabled={deleteGameMutation.isPending}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageGamesPage;