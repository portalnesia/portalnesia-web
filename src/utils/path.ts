import nodePath from 'path'
import * as fsNode from 'fs'

module Path {
  export const fs = fsNode
  export const path = nodePath;
  export const contentPath = nodePath.resolve(process.env.PATH_CONTENT as string)
  export const rootPath = nodePath.resolve(process.env.PATH_ROOT as string)

  const type_obj = {
    root:rootPath,
    content:contentPath
  }

  export function join(type: keyof typeof type_obj,...path: string[]) {
    const paths = [
      type_obj[type],
      ...path
    ];
    return nodePath.join(...paths)
  }

  export function resolve(type: keyof typeof type_obj,...path: string[]) {
    return nodePath.resolve(join(type,...path))
  }
}

export default Path;