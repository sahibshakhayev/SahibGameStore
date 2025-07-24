import * as React from 'react';
import { List, Datagrid, TextField, EditButton, Edit, Create, SimpleForm, TextInput, required, DeleteButton } from 'react-admin';

export const GenreList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" />
            <TextField source="description" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

const GenreForm = () => (
    <SimpleForm>
        <TextInput source="name" validate={required()} fullWidth />
        <TextInput source="description" multiline fullWidth />
    </SimpleForm>
);

export const GenreEdit = () => <Edit><GenreForm /></Edit>;
export const GenreCreate = () => <Create><GenreForm /></Create>;