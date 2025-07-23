// src/pages/admin/ManageGenresPage.tsx
import React, { useState } from 'react';
import { AxiosError } from 'axios'; // Import AxiosError
import {
  useGetApiGenres,
  usePostApiGenres,
  usePutApiGenres,
  useDeleteApiGenresId, // Corrected hook name for DELETE /{id}
  getGetApiGenresQueryKey, // <--- Import the query key helper
  getApiGenres, // For Awaited<ReturnType>
  postApiGenres, // For Awaited<ReturnType>
  putApiGenres, // For Awaited<ReturnType>
  deleteApiGenresId, // For Awaited<ReturnType>
} from '../../lib/api/endpoints.ts';
import LoadingSpinner from '../../components/common/LoadingSpinner.tsx';
import AlertMessage from '../../components/common/AlertMessage.tsx';
import type { AddOrUpdateGenreDTO, GenreViewModel } from '../../types/api.ts/index.ts';
import { useQueryClient } from '@tanstack/react-query';

const ManageGenresPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingGenre, setEditingGenre] = useState<GenreViewModel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formInput, setFormInput] = useState<AddOrUpdateGenreDTO>({
    name: '',
    description: '',
  });

  // Helper to safely extract error message
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

  // Fetch all genres - Explicitly type TData and TError
  const { data: genres, isLoading, isError, error: genresError } = useGetApiGenres<GenreViewModel[], AxiosError>({
    query: {
      // options for this query go here
    }
  });

  // Mutations
  const createGenreMutation = usePostApiGenres<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof postApiGenres>>) => { // data is likely void from API spec
        queryClient.invalidateQueries({ queryKey: getGetApiGenresQueryKey() }); // <--- Corrected: Use helper function
        setShowForm(false);
        setFormInput({ name: '', description: '' });
        alert('Genre created successfully!');
      },
      onError: (err: AxiosError) => {
        console.error('Create genre failed:', err);
        alert(`Failed to create genre: ${getErrorMessage(err)}`);
      },
    },
  });

  const updateGenreMutation = usePutApiGenres<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof putApiGenres>>) => { // data is likely void from API spec
        queryClient.invalidateQueries({ queryKey: getGetApiGenresQueryKey() }); // <--- Corrected: Use helper function
        setShowForm(false);
        setEditingGenre(null);
        setFormInput({ name: '', description: '' });
        alert('Genre updated successfully!');
      },
      onError: (err: AxiosError) => {
        console.error('Update genre failed:', err);
        alert(`Failed to update genre: ${getErrorMessage(err)}`);
      },
    },
  });

  const deleteGenreMutation = useDeleteApiGenresId<AxiosError, unknown>({ // <--- Corrected hook name
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof deleteApiGenresId>>) => { // data is likely void from API spec
        queryClient.invalidateQueries({ queryKey: getGetApiGenresQueryKey() }); // <--- Corrected: Use helper function
        alert('Genre deleted successfully!');
      },
      onError: (err: AxiosError) => {
        console.error('Delete genre failed:', err);
        alert(`Failed to delete genre: ${getErrorMessage(err)}`);
      },
    },
  });

  const handleEdit = (genre: GenreViewModel) => {
    setEditingGenre(genre);
    setFormInput({
      id: genre.id,
      name: genre.name || '',
      description: genre.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this genre?')) {
      deleteGenreMutation.mutate({ id }); // Corrected: wrap ID in object for mutation variables
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormInput((prev: AddOrUpdateGenreDTO) => ({ ...prev, [name]: value })); // <--- Explicitly type 'prev'
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wrap data in { data: ... } for create/update mutations
    if (editingGenre) {
      updateGenreMutation.mutate({ data: formInput });
    } else {
      createGenreMutation.mutate({ data: formInput });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <AlertMessage type="error" message={`Error loading genres: ${getErrorMessage(genresError as AxiosError | Error | null)}`} />;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Genres</h1>

      <button
        onClick={() => { setShowForm(!showForm); setEditingGenre(null); setFormInput({ name: '', description: '' }); }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        {showForm ? 'Hide Form' : 'Add New Genre'}
      </button>

      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-md shadow-inner">
          <h2 className="text-2xl font-semibold mb-4">{editingGenre ? 'Edit Genre' : 'Create New Genre'}</h2>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input type="text" id="name" name="name" value={formInput.name || ''} onChange={handleFormChange} required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
              <textarea id="description" name="description" value={formInput.description || ''} onChange={handleFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3}></textarea>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                disabled={createGenreMutation.isPending || updateGenreMutation.isPending}
              >
                {editingGenre ? (updateGenreMutation.isPending ? 'Updating...' : 'Update Genre') : (createGenreMutation.isPending ? 'Creating...' : 'Create Genre')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingGenre(null); setFormInput({ name: '', description: '' }); }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Genres Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {genres?.map((genre: GenreViewModel) => ( // <--- Explicitly type 'genre'
              <tr key={genre.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {genre.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {genre.description || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(genre)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(genre.id!)}
                    className="text-red-600 hover:text-red-900"
                    disabled={deleteGenreMutation.isPending}
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

export default ManageGenresPage;