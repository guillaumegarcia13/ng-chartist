import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChange
} from '@angular/core';

import * as Chartist from 'chartist';

export type ChartType = 'Pie' | 'Bar' | 'Line';

interface Changes {
  type?: SimpleChange;
  data?: SimpleChange;
  options?: SimpleChange;
  responsiveOptions?: SimpleChange;
}

@Component({
  selector: 'chartist',
  template: '<ng-content></ng-content>'
})
class ChartistComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: (Promise<Chartist.IChartistData> | Chartist.IChartistData);
  @Input() type: (Promise<ChartType> | ChartType);
  @Input() options: (Promise<Chartist.IChartOptions> | Chartist.IChartOptions);
  // TODO: give this a better type
  @Input() responsiveOptions: (Promise<Chartist.IResponsiveOptionTuple<any>> | Chartist.IResponsiveOptionTuple<any>);

  private element: HTMLElement;
  private chart: (Chartist.IChartistPieChart | Chartist.IChartistBarChart | Chartist.IChartistLineChart);

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngOnInit(): void {
    this.renderChart();
  }

  // https://github.com/angular/angular/issues/6292
  ngOnChanges(changes: Changes): void {
    this.update(changes);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.detatch();
    }
  }

  renderChart(): Promise<Chartist.IChartistPieChart | Chartist.IChartistBarChart | Chartist.IChartistLineChart> {
    const promises: any[] = [
      this.type,
      this.element,
      this.data,
      this.options,
      this.responsiveOptions
    ];

    return Promise.all(promises).then((values) => {
      const [type, ...args]: any = values;

      this.chart = Chartist[type](...args);

      return this.chart;
    });
  }

  update(changes: Changes): void {
    if (!this.chart || 'type' in changes) {
      this.renderChart();
    } else {
      let data: any;
      let options: Chartist.IChartOptions;
      let responsiveOptions: any;

      if (changes.data === undefined) {
        data = this.data;
      } else {
        data = changes.data.currentValue;
      }

      if (options === undefined) {
        options = this.options;
      } else {
        options = changes.options.currentValue;
      }

      if (responsiveOptions === undefined) {
        responsiveOptions = this.responsiveOptions;
      } else {
        responsiveOptions = changes.responsiveOptions.currentValue;
      }

      (<any>this.chart).update(
        data,
        options,
        responsiveOptions
      );
    }
  }
}

export {
  ChartistComponent
};
