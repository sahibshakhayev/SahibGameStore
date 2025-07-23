// src/pages/admin/ManageCompaniesPage.tsx
import React, { useState } from 'react';
import { AxiosError } from 'axios'; // Import AxiosError
import {
  // --- Corrected Hook Imports ---
  useGetApiCompanies,
  usePostApiCompanies,
  usePutApiCompanies,
  useDeleteApiCompaniesId,
  // Helper functions for query invalidation
  getGetApiCompaniesQueryKey,
  // Base functions for Awaited<ReturnType> generics
  getApiCompanies,
  postApiCompanies,
  putApiCompanies,
  deleteApiCompaniesId,
} from '../../lib/api/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import type { AddOrUpdateCompanyDTO, CompanyViewModel } from '../../types/api.ts'; // <--- Check this import path
import { useQueryClient } from '@tanstack/react-query';

const ManageCompaniesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingCompany, setEditingCompany] = useState<CompanyViewModel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formInput, setFormInput] = useState<AddOrUpdateCompanyDTO>({
    name: '',
    founded: new Date().toISOString(), // Ensure ISO string for date-time
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

  // Fetch all companies - Explicitly type TData and TError
  const { data: companies, isLoading, isError, error: companiesError } = useGetApiCompanies<CompanyViewModel[], AxiosError>({
    query: {
      // options for this query go here
    }
  });

  // Mutations
  const createCompanyMutation = usePostApiCompanies<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof postApiCompanies>>) => { // data is likely void from API spec
        queryClient.invalidateQueries({ queryKey: getGetApiCompaniesQueryKey() });
        setShowForm(false);
        setFormInput({ name: '', founded: new Date().toISOString() });
        alert('Company created successfully!');
      },
      onError: (err: AxiosError) => { // <--- Explicitly type 'err'
        console.error('Create company failed:', err);
        alert(`Failed to create company: ${getErrorMessage(err)}`);
      },
    },
  });

  const updateCompanyMutation = usePutApiCompanies<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof putApiCompanies>>) => { // data is likely void from API spec
        queryClient.invalidateQueries({ queryKey: getGetApiCompaniesQueryKey() });
        setShowForm(false);
        setEditingCompany(null);
        setFormInput({ name: '', founded: new Date().toISOString() });
        alert('Company updated successfully!');
      },
      onError: (err: AxiosError) => { // <--- Explicitly type 'err'
        console.error('Update company failed:', err);
        alert(`Failed to update company: ${getErrorMessage(err)}`);
      },
    },
  });

  const deleteCompanyMutation = useDeleteApiCompaniesId<AxiosError, unknown>({ // <--- Corrected hook name
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof deleteApiCompaniesId>>) => { // data is likely void from API spec
        queryClient.invalidateQueries({ queryKey: getGetApiCompaniesQueryKey() });
        alert('Company deleted successfully!');
      },
      onError: (err: AxiosError) => { // <--- Explicitly type 'err'
        console.error('Delete company failed:', err);
        alert(`Failed to delete company: ${getErrorMessage(err)}`);
      },
    },
  });

  const handleEdit = (company: CompanyViewModel) => {
    setEditingCompany(company);
    setFormInput({
      id: company.id,
      name: company.name || '',
      founded: company.founded ? new Date(company.founded).toISOString() : new Date().toISOString(), // Ensure ISO string
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      deleteCompanyMutation.mutate({ id }); // <--- Wrap ID in object for mutation variables
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormInput((prev: AddOrUpdateCompanyDTO) => ({ ...prev, [name]: value })); // <--- Explicitly type 'prev'
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wrap data in { data: ... } for create/update mutations
    if (editingCompany) {
      updateCompanyMutation.mutate({ data: formInput });
    } else {
      createCompanyMutation.mutate({ data: formInput });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <AlertMessage type="error" message={`Error loading companies: ${getErrorMessage(companiesError as AxiosError | Error | null)}`} />;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Companies (Developers/Publishers)</h1>

      <button
        onClick={() => { setShowForm(!showForm); setEditingCompany(null); setFormInput({ name: '', founded: new Date().toISOString() }); }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        {showForm ? 'Hide Form' : 'Add New Company'}
      </button>

      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-md shadow-inner">
          <h2 className="text-2xl font-semibold mb-4">{editingCompany ? 'Edit Company' : 'Create New Company'}</h2>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input type="text" id="name" name="name" value={formInput.name || ''} onChange={handleFormChange} required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label htmlFor="founded" className="block text-gray-700 text-sm font-bold mb-2">Founded Date:</label>
              {/* Using type="date" requires YYYY-MM-DD. If backend uses datetime, consider converting. */}
              <input type="date" id="founded" name="founded" value={formInput.founded?.split('T')[0] || ''} onChange={handleFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
              >
                {editingCompany ? (updateCompanyMutation.isPending ? 'Updating...' : 'Update Company') : (createCompanyMutation.isPending ? 'Creating...' : 'Create Company')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingCompany(null); setFormInput({ name: '', founded: new Date().toISOString() }); }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Companies Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Founded</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies?.map((company: CompanyViewModel) => ( // <--- Explicitly type 'company'
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {company.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(company.founded || '').toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(company)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.id!)}
                    className="text-red-600 hover:text-red-900"
                    disabled={deleteCompanyMutation.isPending}
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

export default ManageCompaniesPage;