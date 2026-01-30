import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataGenerator } from './data-generator';

describe('DataGenerator', () => {
  let component: DataGenerator;
  let fixture: ComponentFixture<DataGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGenerator],
    }).compileComponents();

    fixture = TestBed.createComponent(DataGenerator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
