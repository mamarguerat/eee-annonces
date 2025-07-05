module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  packagerConfig: {
    icon: '/images/icon' // no file extension required
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: '/images/icon.png'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};