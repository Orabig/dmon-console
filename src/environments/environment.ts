// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  centrifugoServerUrl: 'http://centrifugo.crocoware.com:8000/connection',
  centrifugoAuthEndpoint: "http://centrifugo.crocoware.com:9191/api/auth.php",
  dmonApiRoot: 'http://centrifugo.crocoware.com:9191/api/'
};
