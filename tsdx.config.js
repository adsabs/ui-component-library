const bundled = [
  'react-async-script',
  'hoist-non-react-statics',
];

module.exports = {
  rollup(config) {
    const origExternalCheck = config.external;
    config.external = (id) => {
      return bundled.includes(id) ? null : origExternalCheck(id);
    };
    return config;
  },
};
