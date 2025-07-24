import * as React from 'react';
import { List, Datagrid, TextField, DateField, EditButton, Edit, Create, SimpleForm, TextInput, DateInput, required, DeleteButton } from 'react-admin';

export const CompanyList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" />
            <DateField source="founded" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

const CompanyForm = () => (
    <SimpleForm>
        <TextInput source="name" validate={required()} fullWidth />
        <DateInput source="founded" />
    </SimpleForm>
);

export const CompanyEdit = () => <Edit><CompanyForm /></Edit>;
export const CompanyCreate = () => <Create><CompanyForm /></Create>;
