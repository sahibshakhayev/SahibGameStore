// src/pages/admin/ManagePlatformsPage.tsx
import React, { useState } from 'react';
import { AxiosError } from 'axios'; // Import AxiosError
import {
  // --- Corrected Hook Imports ---
  useGetApiPlatforms,
  usePostApiPlatforms,
  usePutApiPlatforms,
  useDeleteApiPlatformsId,
  // Helper functions for query invalidation
  getGetApiPlatformsQueryKey,
  // Base functions for Awaited<ReturnType> generics
  getApiPlatforms,
  postApiPlatforms,
  putApiPlatforms,
  deleteApiPlatformsId,
} from '../../lib/api/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import type { AddOrUpdatePlatformDTO, PlatformViewModel } from '../../types/api.ts'; // <--- Check this import path
import { useQueryClient } from '@tanstack/react-query';

const ManagePlatformsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingPlatform, setEditingPlatform] = useState<PlatformViewModel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formInput, setFormInput] = useState<AddOrUpdatePlatformDTO>({
    name: '',
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

  // Fetch all platforms - Explicitly type TData and TError
  const { data: platforms, isLoading, isError, error: platformsError } = useGetApiPlatforms<PlatformViewModel[], AxiosError>({
    query: {
      // options for this query go here
    }
  });

  // Mutations
  const createPlatformMutation = usePostApiPlatforms<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof postApiPlatforms>>) => { // data is likely void from API spec
        queryClient.invalidateQueries({ queryKey: getGetApiPlatformsQueryKey() });
        setShowForm(false);
        setFormInput({ name: '' });
        alert('Platform created successfully!');
      },
      onError: (err: AxiosError) => { // <--- Explicitly type 'err'
        console.error('Create platform failed:', err);
        alert(`Failed to create platform: ${getErrorMessage(err)}`);
      },
    },
  });

  const updatePlatformMutation = usePutApiPlatforms<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof putApiPlatforms>>) => { // data is likely void from API spec
        queryClient.invalidateQueries({ queryKey: getGetApiPlatformsQueryKey() });
        setShowForm(false);
        setEditingPlatform(null);
        setFormInput({ name: '' });
        alert('Platform updated successfully!');
      },
      onError: (err: AxiosError) => { // <--- Explicitly type 'err'
        console.error('Update platform failed:', err);
        alert(`Failed to update platform: ${getErrorMessage(err)}`);
      },
    },
  });

  const deletePlatformMutation = useDeleteApiPlatformsId<AxiosError, unknown>({ // <--- Corrected hook name
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof deleteApiPlatformsId>>) => { // data is likely void from API spec
        queryClient.invalidateQueries({ queryKey: getGetApiPlatformsQueryKey() });
        alert('Platform deleted successfully!');
      },
      onError: (err: AxiosError) => { // <--- Explicitly type 'err'
        console.error('Delete platform failed:', err);
        alert(`Failed to delete platform: ${getErrorMessage(err)}`);
      },
    },
  });

  const handleEdit = (platform: PlatformViewModel) => {
    setEditingPlatform(platform);
    setFormInput({
      id: platform.id,
      name: platform.name || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this platform?')) {
      deletePlatformMutation.mutate({ id }); // <--- Wrap ID in object for mutation variables
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormInput((prev: AddOrUpdatePlatformDTO) => ({ ...prev, [name]: value })); // <--- Explicitly type 'prev'
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wrap data in { data: ... } for create/update mutations
    if (editingPlatform) {
      updatePlatformMutation.mutate({ data: formInput });
    } else {
      createPlatformMutation.mutate({ data: formInput });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <AlertMessage type="error" message={`Error loading platforms: ${getErrorMessage(platformsError as AxiosError | Error | null)}`} />;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Platforms</h1>

      <button
        onClick={() => { setShowForm(!showForm); setEditingPlatform(null); setFormInput({ name: '' }); }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        {showForm ? 'Hide Form' : 'Add New Platform'}
      </button>

      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-md shadow-inner">
          <h2 className="text-2xl font-semibold mb-4">{editingPlatform ? 'Edit Platform' : 'Create New Platform'}</h2>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input type="text" id="name" name="name" value={formInput.name || ''} onChange={handleFormChange} required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                disabled={createPlatformMutation.isPending || updatePlatformMutation.isPending}
              >
                {editingPlatform ? (updatePlatformMutation.isPending ? 'Updating...' : 'Update Platform') : (createPlatformMutation.isPending ? 'Creating...' : 'Create Platform')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingPlatform(null); setFormInput({ name: '' }); }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Platforms Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {platforms?.map((platform: PlatformViewModel) => ( // <--- Explicitly type 'platform'
              <tr key={platform.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {platform.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(platform)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(platform.id!)}
                    className="text-red-600 hover:text-red-900"
                    disabled={deletePlatformMutation.isPending}
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

export default ManagePlatformsPage;