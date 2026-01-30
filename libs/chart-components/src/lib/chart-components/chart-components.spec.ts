import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartComponents } from './chart-components';

describe('ChartComponents', () => {
  let component: ChartComponents;
  let fixture: ComponentFixture<ChartComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartComponents],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartComponents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
