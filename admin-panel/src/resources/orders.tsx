
// resources/orders.tsximport * as React from 'react';
import { 
    List, 
    Datagrid, 
    TextField, 
    DateField, 
    NumberField, 
    SimpleShowLayout, 
    Show, 
    SelectField,
    Edit,
    SimpleForm,
    SelectInput,
    TextInput,
    EditButton,
    DeleteButton,
    required
} from 'react-admin';

// Mapping order status numbers to human-readable text
const orderStatusChoices = [
    { id: 0, name: 'Pending' },
    { id: 1, name: 'Processing' },
    { id: 2, name: 'Shipped' },
    { id: 3, name: 'Delivered' },
    { id: 4, name: 'Cancelled' },
    { id: 5, name: 'Refunded' },
];

export const OrderList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" label="Order ID" />
            {/* The user endpoint isn't in the spec, so we show the user ID. 
                If you had a /users endpoint, you could use a ReferenceField. */}
            <TextField source="userId" label="User ID" />
            <DateField source="orderDate" />
            <NumberField source="total" options={{ style: 'currency', currency: 'USD' }} />
            <SelectField source="status" choices={orderStatusChoices} />
            <EditButton />
            <DeleteButton label="Cancel" mutationMode="pessimistic" />
        </Datagrid>
    </List>
);

export const OrderShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <DateField source="orderDate" />
            <SelectField source="status" choices={orderStatusChoices} />
            <NumberField source="total" options={{ style: 'currency', currency: 'USD' }} />
            <TextField source="userId" label="User ID" />
            <TextField source="address" />
            {/* To show the list of products in the order, you would need to adjust the dataProvider
                to fetch order items and use an <ArrayField> here. */}
        </SimpleShowLayout>
    </Show>
);

export const OrderEdit = () => (
    <Edit title="Update Order Status">
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="userId" label="User ID" disabled />
            <DateField source="orderDate" />
            <SelectInput source="status" choices={orderStatusChoices} validate={required()} />
        </SimpleForm>
    </Edit>
);
