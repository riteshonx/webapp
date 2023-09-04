import { ILocationModel, LocationModel } from 'src/modules/visualize/VisualizeView/models/locationModel';
import { postApi as authenticatedPost } from 'src/services/api';
import { decodeToken } from 'src/services/authservice';

export async function useLocationModel(iLocationModels: ILocationModel[]) {
    const locationModelPromises = iLocationModels.filter((model) => Boolean(model.geometryKey)).map(buildLocationModel);
    const newLocationModels = await Promise.all(locationModelPromises);

    return newLocationModels;
}

async function buildLocationModel(locationModel: ILocationModel) {
    const geometry = await retrieveLocationGeometry(locationModel);
    return new LocationModel(locationModel, geometry);
}

async function retrieveLocationGeometry(locationModel: ILocationModel) {
    const key = {
        key: locationModel.geometryKey,
        expiresIn: 604800,
    }

    const success = await fetchS3links(locationModel.id, key);
    const model = await (await fetch(success[0].url)).arrayBuffer();

    return model;
}

async function fetchS3links(modelId: string, key: any) {
    if (localStorage.getItem('visualize-' + modelId)) {
        const links = JSON.parse(localStorage.getItem('visualize-' + modelId) || '');
        const decodeTkn = decodeToken(links[0].url.split("/").pop());
        const timeNow = Date.now() / 1000;
        if (timeNow < decodeTkn.exp) {
            return links;
        }
    }

    const {success} = await authenticatedPost('V1/S3/downloadLink', [key]);
    localStorage.setItem('visualize-' + modelId, JSON.stringify(success));
    
    return success;
}