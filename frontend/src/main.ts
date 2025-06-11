import { bootstrapApplication } from '@angular/platform-browser';

import { AppConfig, appConfig } from './app/app.config';
import { App } from './app/app';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';


const MY_APP_CONFIG: AppConfig = {
  apiHost: '',
};
function initializeAppFactory(httpClient: HttpClient): () => Observable<AppConfig> {
  return () =>
    httpClient.get<AppConfig>('/api/config/getconfig').pipe(
      tap((config) =>
        Object.assign(MY_APP_CONFIG, {
          ...config,
          apiHost: `https://${config.apiHost}`,
        })
      )
    );
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
