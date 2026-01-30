import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricCardComponent } from './metric-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MetricCardComponent', () => {
  let component: MetricCardComponent;
  let fixture: ComponentFixture<MetricCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MetricCardComponent,
        MatCardModule,
        MatIconModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default icon', () => {
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.metric-icon');
    expect(icon.textContent.trim()).toBe('analytics');
  });

  it('should display custom icon', () => {
    component.icon = 'speed';
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.metric-icon');
    expect(icon.textContent.trim()).toBe('speed');
  });

  it('should display label', () => {
    component.label = 'Test Metric';
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.label');
    expect(label.textContent.trim()).toBe('Test Metric');
  });

  it('should format value with decimals', () => {
    component.value = 15.567;
    component.decimals = 1;
    expect(component.formattedValue).toBe('15.6');
    
    component.decimals = 2;
    expect(component.formattedValue).toBe('15.57');
  });

  it('should display N/A for null value', () => {
    component.value = null;
    expect(component.formattedValue).toBe('N/A');
  });

  it('should display unit', () => {
    component.value = 15.5;
    component.unit = 'bbl/min';
    fixture.detectChanges();
    const unit = fixture.nativeElement.querySelector('.unit');
    expect(unit.textContent.trim()).toBe('bbl/min');
  });

  it('should show calculated badge when isCalculated is true', () => {
    component.isCalculated = true;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge.calculated');
    expect(badge).toBeTruthy();
  });

  it('should not show calculated badge when isCalculated is false', () => {
    component.isCalculated = false;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge.calculated');
    expect(badge).toBeNull();
  });

  it('should display positive trend', () => {
    component.trend = 5.2;
    expect(component.trendIcon).toBe('trending_up');
    expect(component.trendClass).toBe('trend-up');
    expect(component.formattedTrend).toBe('5.2');
  });

  it('should display negative trend', () => {
    component.trend = -3.7;
    expect(component.trendIcon).toBe('trending_down');
    expect(component.trendClass).toBe('trend-down');
    expect(component.formattedTrend).toBe('3.7');
  });

  it('should not display trend when null', () => {
    component.trend = null;
    fixture.detectChanges();
    const trendSection = fixture.nativeElement.querySelector('.trend-section');
    expect(trendSection).toBeNull();
  });

  it('should detect warning state when value below minValue', () => {
    component.value = 5;
    component.minValue = 10;
    expect(component.isWarning).toBe(true);
  });

  it('should detect warning state when value above maxValue', () => {
    component.value = 100;
    component.maxValue = 50;
    expect(component.isWarning).toBe(true);
  });

  it('should not show warning when value is in range', () => {
    component.value = 25;
    component.minValue = 10;
    component.maxValue = 50;
    expect(component.isWarning).toBe(false);
  });

  it('should not show warning when limits are not set', () => {
    component.value = 100;
    expect(component.isWarning).toBe(false);
  });

  it('should apply custom icon color', () => {
    component.iconColor = '#ff0000';
    fixture.detectChanges();
    const iconSection = fixture.nativeElement.querySelector('.icon-section');
    expect(iconSection.style.color).toBe('rgb(255, 0, 0)');
  });

  it('should render complete metric card with all features', () => {
    component.icon = 'speed';
    component.label = 'Rate';
    component.value = 15.5;
    component.unit = 'bbl/min';
    component.trend = 2.3;
    component.isCalculated = false;
    component.decimals = 1;
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.metric-icon').textContent.trim()).toBe('speed');
    expect(compiled.querySelector('.label').textContent.trim()).toBe('Rate');
    expect(compiled.querySelector('.value').textContent.trim()).toBe('15.5');
    expect(compiled.querySelector('.unit').textContent.trim()).toBe('bbl/min');
    expect(compiled.querySelector('.trend-section')).toBeTruthy();
  });
});
