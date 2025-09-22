import * as React from 'react';
import { useEffect, useState } from 'react';
import { 
    EditBase, 
    RecordContextProvider, 
    useGetOne, 
    useRecordContext,
    useEditContext 
} from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
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
const GameForm = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const redirect = useRedirect();
    const record = useRecordContext();

    const [overviewHtml, setOverviewHtml] = useState<string>("");
    const [overviewVideo, setOverviewVideo] = useState<string>("");

    const { data: overviewData } = useGetOne(
        "games/overview",
        { id: record?.id },
        { enabled: !!record?.id }  
    );

    useEffect(() => {
        if (overviewData) {
            setOverviewHtml(overviewData.html || "");
            setOverviewVideo(overviewData.videoRelativeUrl || "");
        }
    }, [overviewData]);

    const handleUpload = async (values: any) => {
        if (!record) return values;

        try {
            // Upload thumb
            if (values.thumb?.rawFile) {
                await dataProvider.uploadThumbImage(record.id, values.thumb.rawFile);
            }

            // Upload cover
            if (values.cover?.rawFile) {
                await dataProvider.uploadCoverImage(record.id, values.cover.rawFile);
            }

            // Upload overview
            if (values.overviewHtml || values.overviewVideo?.rawFile) {
                await dataProvider.uploadOverview(
                    record.id,
                    values.overviewHtml || "",
                    values.overviewVideo?.rawFile
                );
            }

            notify("Game updated successfully", { type: "success" });
            redirect("list", "games");
        } catch (error: any) {
            notify(`Error uploading files: ${error.message}`, { type: "error" });
        }

        return values; // Pass along to main update
    };
    
    return (
        <SimpleForm onSubmit={handleUpload}>
            <TextInput source="name" validate={[required()]} />
            <NumberInput source="price" validate={[required(), minValue(0)]} />
            <NumberInput source="availableQuantity" label="Available Stock" validate={[required(), minValue(0)]} />
            <DateInput source="releaseDate" validate={[required()]} />
            <TextInput source="description" multiline validate={[required(), minLength(10)]} />
            <TextInput source="shortDescription" multiline validate={[required(), minLength(5)]} />
            
            {/* ReferenceArrayInput fetches related data (e.g., all genres) and allows selection */}
            <ReferenceArrayInput source="gameGenreIds" reference="genres">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <ReferenceArrayInput source="gamePlatformIds" reference="platforms">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <ReferenceArrayInput source="gameDeveloperIds" reference="companies">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <ReferenceArrayInput source="gamePublisherIds" reference="companies">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>

            {/* Images */}
            <ImageInput source="thumb" label="Thumbnail" >
                <ImageField source="src" title="title" />
            </ImageInput>
            <ImageInput source="cover" label="Cover" >
                <ImageField source="src" title="title" />
            </ImageInput>

            {/* Overview */}
            <RichTextInput
                source="overviewHtml"
                label="Overview (HTML)"
            />

            {overviewVideo && (
                <div style={{ marginBottom: "1rem" }}>
                    <label>Current Overview Video:</label>
                    <video src={overviewVideo} controls width="400" />
                </div>
            )}

            <ImageInput source="overviewVideo" label="Upload New Overview Video">
                <ImageField source="src" title="title" />
            </ImageInput>
        </SimpleForm>
    );
};

// Fixed Edit component
export const GameEdit = () => {
    return (
        <Edit mutationMode="pessimistic">
            <GameEditInner />
        </Edit>
    );
};

const GameEditInner = () => {
    const { record } = useEditContext();
    
    if (!record) return null;

    // Fetch overview data
    const { data: overview } = useGetOne("games/overview", { id: record.id });

    // Normalize the record structure
    const enrichedRecord = {
        ...record,
        gameGenreIds: record.genres?.map((g: any) => g.id) ?? [],
        gamePlatformIds: record.platforms?.map((p: any) => p.id) ?? [],
        gameDeveloperIds: record.developers?.map((d: any) => d.id) ?? [],
        gamePublisherIds: record.publishers?.map((p: any) => p.id) ?? [],
        overviewHtml: overview?.html ?? "",
        overviewVideoUrl: overview?.videoRelativeUrl ?? "",
    };

    return (
        <RecordContextProvider value={enrichedRecord}>
            <GameForm />
        </RecordContextProvider>
    );
};

// Fixed Create component
export const GameCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();

    const save = async (data: any) => {
        try {
            const { 
                thumb, 
                cover,
                overviewVideo,
                gameGenreIds = [], 
                gamePlatformIds = [], 
                gameDeveloperIds = [],
                gamePublisherIds = [],
                ...gameData 
            } = data;
            
            // Construct the full payload required by the API on creation.
            const createPayload = {
                ...gameData,
                gameGenres: gameGenreIds.map((id: string) => ({ genreId: id })),
                gamePlatforms: gamePlatformIds.map((id: string) => ({ platformId: id })),
                gameDevelopers: gameDeveloperIds.map((id: string) => ({ developerId: id })),
                gamePublishers: gamePublisherIds.map((id: string) => ({ publisherId: id })),
            };

            // Step 1: Create the game with the complete payload.
            const { data: newGame } = await dataProvider.create('games', { data: createPayload });

            if (!newGame?.id) {
                throw new Error("Failed to create game: No ID returned from API.");
            }

            // Step 2: Upload files if they exist
            const uploadPromises = [];

            if (thumb?.rawFile instanceof File) {
                uploadPromises.push(
                    dataProvider.uploadThumbImage(newGame.id, thumb.rawFile)
                );
            }

            if (cover?.rawFile instanceof File) {
                uploadPromises.push(
                    dataProvider.uploadCoverImage(newGame.id, cover.rawFile)
                );
            }

            if (data.overviewHtml || overviewVideo?.rawFile instanceof File) {
                uploadPromises.push(
                    dataProvider.uploadOverview(
                        newGame.id,
                        data.overviewHtml || "",
                        overviewVideo?.rawFile
                    )
                );
            }

            // Wait for all uploads to complete
            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises);
            }

            notify('Game created successfully', { type: 'success' });
            redirect('/games');
            
            return newGame;
        } catch (error: any) {
            const message = error.message || "An unknown error occurred.";
            notify(`Error: ${message}`, { type: 'error' });
            throw error;
        }
    };
    
    return (
        <Create>
            <SimpleForm onSubmit={save}>
                <GameFormCreate />
            </SimpleForm>
        </Create>
    );
};

// Simplified form for create (without overview fetching logic)
const GameFormCreate = () => {
    return (
        <>
            <TextInput source="name" validate={[required()]} />
            <NumberInput source="price" validate={[required(), minValue(0)]} />
            <NumberInput source="availableQuantity" label="Available Stock" validate={[required(), minValue(0)]} />
            <DateInput source="releaseDate" validate={[required()]} />
            <TextInput source="description" multiline validate={[required(), minLength(10)]} />
            <TextInput source="shortDescription" multiline validate={[required(), minLength(5)]} />
            
            <ReferenceArrayInput source="gameGenreIds" reference="genres">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <ReferenceArrayInput source="gamePlatformIds" reference="platforms">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <ReferenceArrayInput source="gameDeveloperIds" reference="companies">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <ReferenceArrayInput source="gamePublisherIds" reference="companies">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>

            <ImageInput source="thumb" label="Thumbnail" >
                <ImageField source="src" title="title" />
            </ImageInput>
            <ImageInput source="cover" label="Cover" >
                <ImageField source="src" title="title" />
            </ImageInput>

            <RichTextInput source="overviewHtml" label="Overview (HTML)" />
            <ImageInput source="overviewVideo" label="Overview Video" >
                <ImageField source="src" title="title" />
            </ImageInput>
        </>
    );
};