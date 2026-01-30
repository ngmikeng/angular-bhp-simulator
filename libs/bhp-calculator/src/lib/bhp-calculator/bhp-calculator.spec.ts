import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BhpCalculator } from './bhp-calculator';

describe('BhpCalculator', () => {
  let component: BhpCalculator;
  let fixture: ComponentFixture<BhpCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BhpCalculator],
    }).compileComponents();

    fixture = TestBed.createComponent(BhpCalculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
