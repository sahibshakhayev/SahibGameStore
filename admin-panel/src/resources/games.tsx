
import * as React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    EditButton,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    DateInput,
    ReferenceArrayInput,
    SelectArrayInput,
    ImageField,
    ImageInput,
    useNotify,
    useRedirect,
    useDataProvider,
    required,
    minValue,
    minLength,
    DeleteButton
} from 'react-admin';

// The List view for Games, showing key information in a table.
export const GameList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" />
            <NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
            <DateField source="releaseDate" />
            <TextField source="availableQuantity" label="Stock" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

// A shared form component for creating and editing games to avoid code duplication.
const GameForm = () => (
    <SimpleForm>
        <TextInput source="name" validate={[required(), minLength(3)]} fullWidth />
        <NumberInput source="price" validate={[required(), minValue(0)]} />
        <NumberInput source="availableQuantity" label="Available Stock" validate={[required(), minValue(0)]} />
        <DateInput source="releaseDate" validate={[required()]} />
        <TextInput source="description" multiline fullWidth validate={[required(), minLength(10)]} />
        <TextInput source="shortDescription" multiline fullWidth />
        
        {/* ReferenceArrayInput fetches related data (e.g., all genres) and allows selection */}
        <ReferenceArrayInput source="gameGenreIds" reference="genres">
            <SelectArrayInput optionText="name" label="Genres" validate={required()} />
        </ReferenceArrayInput>
        
        <ReferenceArrayInput source="gamePlatformIds" reference="platforms">
            <SelectArrayInput optionText="name" label="Platforms" validate={required()} />
        </ReferenceArrayInput>

        <ReferenceArrayInput source="gameDeveloperIds" reference="companies">
            <SelectArrayInput optionText="name" label="Developers" validate={required()} />
        </ReferenceArrayInput>
        
        <ReferenceArrayInput source="gamePublisherIds" reference="companies">
            <SelectArrayInput optionText="name" label="Publishers" validate={required()} />
        </ReferenceArrayInput>

        {/* Image upload input. `source` is a temporary field for the form. */}
        <ImageInput source="thumbImage" label="Thumbnail">
            <ImageField source="src" title="title" />
        </ImageInput>
    </SimpleForm>
);

// The Edit view, which uses the custom GameForm and handles the file upload logic.
export const GameEdit = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();

    // This transform function is called before the data is sent to the dataProvider.
    const save = async (data: any) => {
        const { thumbImage, gameGenreIds, gamePlatformIds, gameDeveloperIds, gamePublisherIds, ...gameData } = data;

        // Format the data to match the API's DTO structure.
        const updatePayload = {
            ...gameData,
            gameGenres: gameGenreIds.map((id: string) => ({ gameId: gameData.id, genreId: id })),
            gamePlatforms: gamePlatformIds.map((id: string) => ({ gameId: gameData.id, platformId: id })),
            gameDevelopers: gameDeveloperIds.map((id: string) => ({ gameId: gameData.id, developerId: id })),
            gamePublishers: gamePublisherIds.map((id: string) => ({ gameId: gameData.id, publisherId: id })),
        };
        
        try {
            // Step 1: Update the game data.
            await dataProvider.update('games', { id: updatePayload.id, data: updatePayload, previousData: {} });

            // Step 2: If a new image was uploaded, call the custom upload method.
            if (thumbImage && thumbImage.rawFile instanceof File) {
                await dataProvider.uploadFile('games', { id: updatePayload.id, data: { file: thumbImage } });
            }
            
            notify('Game updated successfully', { type: 'info' });
            redirect('/games');

        } catch (error: any) {
            notify(`Error: ${error.message}`, { type: 'warning' });
        }
    };

    return (
        <Edit mutationMode="pessimistic" transform={save}>
            <GameForm />
        </Edit>
    );
};

// The Create view uses a similar transform function.
export const GameCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();

    // FIX: Send the full payload in a single 'create' call as required by the API.
    const save = async (data: any) => {
        const { 
            thumbImage, 
            gameGenreIds, 
            gamePlatformIds, 
            gameDeveloperIds,
            gamePublisherIds,
            ...gameData 
        } = data;
        
        // Construct the full payload required by the API on creation.
        // The API expects the relational arrays, even if the gameId is not yet known.
        // We will send just the foreign key for the related entity.
        const createPayload = {
            ...gameData,
            gameGenres: gameGenreIds.map((id: string) => ({ genreId: id })),
            gamePlatforms: gamePlatformIds.map((id: string) => ({ platformId: id })),
            gameDevelopers: gameDeveloperIds.map((id: string) => ({ developerId: id })),
            gamePublishers: gamePublisherIds.map((id: string) => ({ publisherId: id })),
        };

        try {
            // Step 1: Create the game with the complete payload.
            const { data: newGame } = await dataProvider.create('games', { data: createPayload });

            if (!newGame.id) {
                throw new Error("Failed to create game: No ID returned from API.");
            }

            // Step 2: If an image was included, upload it to the newly created game.
            if (thumbImage && thumbImage.rawFile instanceof File) {
                await dataProvider.uploadFile('games', { id: newGame.id, data: { file: thumbImage } });
            }

            notify('Game created successfully', { type: 'success' });
            redirect('/games');
        } catch (error: any) {
            const message = error.message || "An unknown error occurred.";
            notify(`Error: ${message}`, { type: 'warning' });
        }
    };
    
    return (
        <Create transform={save}>
            <GameForm />
        </Create>
    );
};