import request from 'superagent';
import id from './id';
import { downloadFile } from '../utils/download';

async function init(options) {
  options.onInitSuccess();
  options.onSignInSuccess();
}

async function normalizeResource(resource) {
  return {
    capabilities: resource.capabilities,
    createdTime: Date.parse(resource.createdTime),
    id: resource.id,
    modifiedTime: Date.parse(resource.modifiedTime),
    name: resource.name,
    type: resource.type,
    size: resource.size,
    parentId: resource.parentId ? resource.parentId : null
  };
}

async function getCapabilitiesForResource(options, resource) {
  return resource.capabilities || [];
}

async function pathToId(path) {
  return new Promise((resolve, reject) => {
    let id = id.decode(path);
    resolve(id);
  });
}

async function idToPath(id) {
  return new Promise((resolve, reject) => {
    let path = id.encode(id);
    resolve(path);
  });
}

async function getResourceById(options, id) {
  let route = `${options.apiRoot}/files/${id}`;
  let response = await request.get(route).catch((error) => {
    console.error(`Filemanager. getResourceById(${id})`, error);
  });

  let resource = response.body;
  return await normalizeResource(resource);
}

async function getChildrenForId(options, id) {
  let route = `${options.apiRoot}/files/${id}/children`;
  let response = await request.get(route).catch((error) => {
    console.error(`Filemanager. getChildrenForId(${id})`, error);
  });

  let rawResourceChildren = response.body.items;
  let resourceChildren = await Promise.all(rawResourceChildren.map(async (o) => await normalizeResource(o)));
  return { resourceChildren };
}

async function getParentsForId(options, id, result = []) {
  if (!id) {
    return result;
  }

  let resource = await getResourceById(options, id);
  let parentId = resource.parentId;

  if (!parentId) {
    return result;
  }

  let parent = await getResourceById(options, parentId);
  return await getParentsForId(options, resource.parentId, [parent].concat(result));
}

async function getBaseResource(options) {
  let route = `${options.apiRoot}/files`;
  let response = await request.get(route).catch((error) => {
    console.error('Filemanager. getBaseResource()', error);
  });
  return normalizeResource(response.body);
}

async function getRootId(options) {
  let resource = await getBaseResource(options);
  return resource.id;
}

async function getIdForPartPath(options, currId, pathArr) {
  console.log('pathArr:', pathArr);
  console.log(currId);
  let { resourceChildren } = await getChildrenForId(options, currId);

  console.log(resourceChildren);

  for (let i = 0; i < resourceChildren.length; i++) {
    let resource = resourceChildren[i];
    if (resource.name === pathArr[0]) {
      console.log(resource.name, resource.id);
      if (pathArr.length === 1) {
        return resource.id;
      } else {
        return await getIdForPartPath(options, resource.id, pathArr.slice(1));
      }
    }
  }

  return null;
}

async function getIdForPath(options, path) {
  let resource = await getBaseResource(options);

  let pathArr = path.split('/');

  if (pathArr.length === 0 || pathArr[0] !== resource.name) {
    return null;
  }

  if (pathArr.length === 1) {
    return resource.id;
  }

  console.log(resource.id);

  return await getIdForPartPath(options, resource.id, pathArr.slice(1));
}

async function getParentIdForResource(options, resource) {
  return resource.parentId;
}

async function readLocalFile() {
  return new Promise((resolve, reject) => {
    let uploadInput = document.createElement("input");
    uploadInput.addEventListener('change', (e) => {
      let file = uploadInput.files[0];
      resolve({
        type: file.type,
        name: file.name,
        file
      });
    });

    uploadInput.type = "file";
    document.body.appendChild(uploadInput);
    uploadInput.click();
    document.body.removeChild(uploadInput);
  });
}

async function uploadFileToId(options, parentId, { onStart, onSuccess, onFail, onProgress }) {
  let file =  await readLocalFile(true);
  let route = `${options.apiRoot}/files`;
  onStart({ name: file.name, size: file.file.size });
  request.post(route).
  field('type', 'file').
  field('parentId', parentId).
  attach('files', file.file, file.name).
  on('progress', event => {
    onProgress(event.percent);
  }).
  end(error => {
    if (error) {
      console.log(`Filemanager. uploadFileToId(${parentId})`, error);
      onFail();
    } else {
      onSuccess();
    }
  });
}

async function downloadResources(options, items) {
  let name = items[0].name;
  let route = `${options.apiRoot}/download`;
  let req = request.get(route);
  for (let i = 0; i < items.length; i++) {
    req.query({ items: items[i].id });
  }
  req.
  responseType('blob').
  end((err, res) => {
    if (err) {
      return console.error('Failed to download resource:', err);
    }
    downloadFile(res.body, name);
  });
}

async function createFolder(options, parentId, folderName) {
  let route = `${options.apiRoot}/files`;
  let params = {
    parentId,
    name: folderName,
    type: 'dir'
  };
  let response = await request.post(route).send(params).
  catch((error) => {
    console.error(`Filemanager. createFolder(${id})`, error);
  });
  return response;
}

function getResourceName(apiOptions, resource) {
  return resource.name;
}

async function renameResource(options, id, newName) {
  let route = `${options.apiRoot}/files/${id}`;
  let method = 'PATCH';
  let response = await request(method, route).type('application/json').send({ name: newName }).
  catch((error) => {
    console.error(`Filemanager. renameResource(${id})`, error);
  });
  return response;
}

async function removeResource(options, resource) {
  let route = `${options.apiRoot}/files/${resource.id}`;
  let method = 'DELETE';
  let response = await request(method, route).
  catch((error) => {
    throw error;
  });
  return response;
}

async function removeResources(options, selectedResources, { onSuccess, onFail }) {
  let success = await Promise.all(selectedResources.map(async (resource) => await removeResource(options, resource))).
  catch((error) => {
    console.error(`Filemanager. removeResources`, error);
    onFail();
  });
  onSuccess();
}

export default {
  init,
  pathToId,
  idToPath,
  getIdForPath,
  getResourceById,
  getCapabilitiesForResource,
  getChildrenForId,
  getRootId,
  getParentsForId,
  getParentIdForResource,
  getResourceName,
  createFolder,
  downloadResources,
  renameResource,
  removeResources,
  uploadFileToId
};
