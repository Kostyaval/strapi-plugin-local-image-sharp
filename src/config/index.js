'use strict';

const { pluginConfigSchema } = require('./schema');

module.exports = {
  default: ({ env }) => ({
    cacheDir: env('STRAPI_PLUGIN_LOCAL_IMAGE_SHARP_CACHE_DIR', ''),
    maxAge: 3600,
  }),
  validator(config) {
    pluginConfigSchema.validateSync(config);
  },
};
