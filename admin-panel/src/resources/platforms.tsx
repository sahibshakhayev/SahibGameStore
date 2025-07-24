import * as React from 'react';
import { List, Datagrid, TextField, EditButton, Edit, Create, SimpleForm, TextInput, required, DeleteButton } from 'react-admin';

export const PlatformList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

const PlatformForm = () => (
    <SimpleForm>
        <TextInput source="name" validate={required()} fullWidth />
    </SimpleForm>
);

export const PlatformEdit = () => <Edit><PlatformForm /></Edit>;
export const PlatformCreate = () => <Create><PlatformForm /></Create>;
