import request from 'superagent';
import id from '../../../../../server-nodejs/utils/id';

async function init(options) {
  options.onInitSuccess();
  options.onSignInSuccess();
}

async function normalizeResource(resource) {
  return {
    createDate: Date.parse(resource.createDate),
    id: resource.id,
    modifyDate: Date.parse(resource.modifyDate),
    title: resource.title,
    type: resource.type,
    size: resource.size,
    ancestors: resource.ancestors,
    parentId: resource.ancestors ? resource.ancestors[resource.ancestors.length - 1] : null
  };
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
  let method = 'GET';
  let response = await request(method, route).catch((error) => {
    console.error(`Filemanager. getResourceById(${id})`, error);
  });

  let resource = response.body;
  return await normalizeResource(resource);
}

async function getChildrenForId(options, id) {
  let route = `${options.apiRoot}/files/${id}/children`;
  let method = 'GET';
  let response = await request(method, route).catch((error) => {
    console.error(`Filemanager. getChildrenForId(${id})`, error);
  });

  let rawResourceChildren = response.body.items;
  let resourceChildren = await Promise.all(rawResourceChildren.map(async (o) => await normalizeResource(o)));
  return { resourceChildren };
}

async function getParentsForId(options, id) {
  let resource = await getResourceById(options, id);

  if (!resource.ancestors) {
    return [];
  }

  let parents = await Promise.all(resource.ancestors.map(async (id) => await getResourceById(options, id)));
  return parents;
}

async function getParentIdForResource(options, resource) {
  return resource.parentId;
}

export default {
  init,
  pathToId,
  idToPath,
  getResourceById,
  getChildrenForId,
  getParentsForId,
  getParentIdForResource
};
