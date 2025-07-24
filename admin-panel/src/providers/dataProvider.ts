
// This is the most critical file. It acts as a translator between
// react-admin's data requests and your specific API endpoints and data structures.
// We are mapping react-admin's generic method calls (e.g., getList, getOne)
// to your API's specific URLs and expected data formats.

import { DataProvider, fetchUtils, GetListParams, CreateParams, UpdateParams, DeleteParams, GetOneParams, GetManyParams, DeleteManyParams, DeleteManyResult, GetManyReferenceParams, GetManyReferenceResult, QueryFunctionContext, RaRecord, UpdateManyParams, UpdateManyResult } from 'react-admin';
import { stringify } from 'query-string';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5159/api';

// A custom httpClient that attaches the JWT token to every request.
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('token');
    (options.headers as Headers).set('Authorization', `Bearer ${token}`);
    return fetchUtils.fetchJson(url, options);
};

// The main DataProvider object.
export const dataProvider: DataProvider = {
    // getList is called to fetch a paginated list of records.
    getList: (resource, params: GetListParams) => {
        const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
        const { field, order } = params.sort || { field: 'id', order: 'ASC' };

        // Maps react-admin's params to your API's query parameters.
        const query = {
            SortBy: field,
            IsDescending: order === 'DESC',
            PageNumber: page,
            PageSize: perPage,
            ...params.filter,
        };
        const url = `${API_URL}/${resource}?${stringify(query)}`;

        if (resource == "games" || resource == "orders") {

        return httpClient(url).then(({ headers, json }) => {
            // React-admin requires a 'total' count for pagination.
            // Your API should provide this, ideally in a 'X-Total-Count' header.
            const total = json.totalCount;
            return {
                data: json.items.map((item: any) => ({ ...item, id: item.id })), // Ensure each item has an 'id' property
                total: total ? parseInt(total, 10) : json.length,
            };
        });

    }

    return httpClient(url).then(({ headers, json }) => {
            // React-admin requires a 'total' count for pagination.
            // Your API should provide this, ideally in a 'X-Total-Count' header.
            const total = headers.get('x-total-count');
            return {
                data: json.map((item: any) => ({ ...item, id: item.id })), // Ensure each item has an 'id' property
                total: total ? parseInt(total, 10) : json.length,
            };
        });

    
    },
    
    // getOne fetches a single record by its ID.
    getOne: (resource, params: GetOneParams) => httpClient(`${API_URL}/${resource}/${params.id}`).then(({ json }) => ({
        data: { ...json, id: json.id },
    })),

    // getMany fetches multiple records by their IDs. Used for reference fields.
    getMany: (resource, params: GetManyParams) => {
        // This endpoint is not explicitly in your schema, so we simulate it by calling getOne multiple times.
        // For production, it's better to have a dedicated `GET /resource?ids=1,2,3` endpoint.
        return Promise.all(
            params.ids.map(id => httpClient(`${API_URL}/${resource}/${id}`).then(({ json }) => json))
        ).then(data => ({ data: data.map(item => ({ ...item, id: item.id })) }));
    },

    // update sends a PUT request to update a record.
    update: (resource, params: UpdateParams) => {
        
        if (resource == 'orders') {
            
          return httpClient(`${API_URL}/${resource}/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: { ...json, id: json.id } }));

        }


        
       return httpClient(`${API_URL}/${resource}`, {
        method: 'PUT',
        body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: { ...json, id: json.id } }));




},

    // create sends a POST request to create a new record.
    create: (resource, params: CreateParams) => httpClient(`${API_URL}/${resource}`, {
        method: 'POST',
        body: JSON.stringify(params.data),
    }).then(({ json }) => ({
        data: { ...(params.data as any), id: json.id || json.Id }, // Handle potential casing differences
    })),

    // delete sends a DELETE request to remove a record.
    delete: (resource, params: DeleteParams) => httpClient(`${API_URL}/${resource}/${params.id}`, {
        method: 'DELETE',
    }).then(({ json }) => ({ data: { ...json, id: json.id } })),

    // This is a custom method to handle file uploads, which react-admin doesn't support out-of-the-box.
    // We will call this from our GameEdit component.
    uploadFile: (resource: string, params: { id: string; data: { file: { rawFile: File; }; }; }) => {
        const formData = new FormData();
        // react-admin's <ImageInput> provides the file in this structure.
        formData.append('file', params.data.file.rawFile);

        return httpClient(`${API_URL}/${resource}/${params.id}/uploadthumbimage`, {
            method: 'PUT', // Your schema specifies PUT for this endpoint
            body: formData,
        }).then(({ json }) => ({ data: json }));
    },
    getManyReference: function <RecordType extends RaRecord = any>(resource: string, params: GetManyReferenceParams & QueryFunctionContext): Promise<GetManyReferenceResult<RecordType>> {
        throw new Error('Function not implemented.');
    },
    updateMany: function <RecordType extends RaRecord = any>(resource: string, params: UpdateManyParams): Promise<UpdateManyResult<RecordType>> {
        throw new Error('Function not implemented.');
    },
    deleteMany: function <RecordType extends RaRecord = any>(resource: string, params: DeleteManyParams<RecordType>): Promise<DeleteManyResult<RecordType>> {
        throw new Error('Function not implemented.');
    }
};

