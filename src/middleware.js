'use strict';

const { decode, parseURL, getQuery } = require('ufo');
const { hash } = require('ohash');
const { join } = require('path');
const { createReadStream, existsSync } = require('fs');
const { writeFile, readFile } = require('fs/promises');
const getEtag = require('etag');

function parseImageUrl(url) {
  const result = {
    id: '',
    modifiers: null
  }
  const {pathname: path, search: queryString} = parseURL(url)

  const pathParts = path.replace('uploads/', '').split('/')

  result.id = pathParts.pop() // get last item of pathParts array (which always equal id) and remove it from pathParts

  const pathModifier = pathParts.pop() // get path part before id (which always equal pathModifier)

  if(pathModifier && pathModifier !== '_') {
    result.modifiers = Object.create(null)
    for (const p of pathModifier.split(',')) {
      const [key, value = ''] = p.split('_');
      result.modifiers[key] = decode(value);
    }
    return result
  }
  if(queryString) {
    result.modifiers = getQuery(queryString)
    return result
  }

  return result

}

function createMiddleware(ipx) {
  const config = strapi.config.get('plugin.local-image-sharp');

  return async function ipxMiddleware(ctx, next) {

    const allowedTypes = [
      'JPEG',
      'PNG',
      'GIF',
      'SVG',
      'TIFF',
      'ICO',
      'DVU',
      'JPG',
      'WEBP',
      'AVIF',
    ];

    const {id, modifiers} = parseImageUrl(ctx.req.url)

    // if no id or no modifiers or not allowed type, skip
    if (
      !id ||
      !modifiers ||
      !allowedTypes.includes(id.split('.').pop().toUpperCase())
    ) {
      await next();
      return;
    }

    const objectHash = hash({ id, modifiers });

    let tempFilePath;
    let tempTypePath;
    let tempEtagPath;
    // If cache enabled, check if file exists
    if (config.cacheDir) {
      tempFilePath = join(config.cacheDir, `${objectHash}.raw`);
      tempTypePath = join(config.cacheDir, `${objectHash}.mime`);
      tempEtagPath = join(config.cacheDir, `${objectHash}.etag`);

      if (existsSync(tempFilePath)) {
        try {
          const [type, etag] = await Promise.all([
            readFile(tempTypePath, 'utf-8'),
            readFile(tempEtagPath, 'utf-8'),
          ]);
          const stream = createReadStream(tempFilePath);

          ctx.set('ETag', etag);
          if (etag && ctx.req.headers['if-none-match'] === etag) {
            ctx.status = 304;
            return;
          }

          // Cache-Control
          if (config.maxAge) {
            ctx.set(
              'Cache-Control',
              `max-age=${+config.maxAge}, public, s-maxage=${+config.maxAge}`
            );
          }

          // Mime
          if (type) {
            ctx.set('Content-Type', type);
          }
          ctx.body = stream;
          return;
        } catch {
          // file not found, continue to generate fresh image
        }
      }
    }

    // Create request
    const img = ipx(id, modifiers, ctx.req.options);

    // Get image meta from source
    try {
      const src = await img.src();

      // Caching headers
      if (src.mtime) {
        if (ctx.req.headers['if-modified-since']) {
          if (new Date(ctx.req.headers['if-modified-since']) >= src.mtime) {
            ctx.status = 304;
            return;
          }
        }
        ctx.set('Last-Modified', `${+src.mtime}`);
      }

      const maxAge = src.maxAge ?? config.maxAge;

      if (maxAge) {
        ctx.set(
          'Cache-Control',
          `max-age=${+maxAge}, public, s-maxage=${+maxAge}`
        );
      }

      // Get converted image
      const { data, format } = await img.data();

      // ETag
      const etag = getEtag(data);

      // If cache enabled, write image to temp dir
      if (tempTypePath && tempFilePath) {
        Promise.all([
          writeFile(tempTypePath, `image/${format}`, 'utf-8'),
          writeFile(tempEtagPath, etag, 'utf-8'),
          writeFile(tempFilePath, data),
        ]).catch(() => {
          // console.error(error);
        });
      }

      ctx.set('ETag', etag);
      if (etag && ctx.req.headers['if-none-match'] === etag) {
        ctx.status = 304;
        return;
      }

      // Mime
      if (format) {
        ctx.set('Content-Type', `image/${format}`);
      }

      ctx.body = data;
    } catch (error) {
      const statusCode = parseInt(error.statusCode, 10) || 500;
      const statusMessage = error.message
        ? `IPX Error (${error.message})`
        : `IPX Error (${statusCode})`;
      strapi.log.debug(statusMessage);
      // console.error(error);

      ctx.status = statusCode;
    }
  };
}

module.exports = {
  createMiddleware,
  parseImageUrl
};
