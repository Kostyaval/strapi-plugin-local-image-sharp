'use strict';

const yup = require('yup');

const pluginConfigSchema = yup.object().shape({
  cacheDir: yup.string(),
  maxAge: yup.number().moreThan(0),
  strict: yup.mixed().oneOf([true,false, yup.object().shape({
    allowModifiers: yup.array().of(yup.string()).min(0)
  })]),
  presets: yup.object().shape(
    yup.lazy((obj) => {
      const dynamicSchema = {};
      Object.keys(obj).forEach((key) => {
        dynamicSchema[key] = yup.object().shape(
          yup.lazy((innerObj) => {
            const subSchema = {};
            Object.keys(innerObj).forEach((innerKey) => {
              subSchema[innerKey] = yup.string();
            });
            return yup.object().shape(subSchema);
          })
        );
      });
      return yup.object().shape(dynamicSchema);
    })
  )
});

module.exports = {
  pluginConfigSchema,
};
