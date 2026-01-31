import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appRoutes } from './app.routes';

// import echarts core
import * as echarts from 'echarts/core';
import { provideEchartsCore } from 'ngx-echarts';
import { LineChart } from 'echarts/charts';
import { GridComponent, TitleComponent, LegendComponent, TooltipComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([LineChart, GridComponent, TitleComponent, LegendComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideAnimations(),
    provideEchartsCore({ echarts }),
  ],
};
