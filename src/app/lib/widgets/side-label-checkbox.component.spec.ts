import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SideLabelCheckboxComponent } from './side-label-checkbox.component';

describe('SideLabelCheckboxComponent', () => {
  let component: SideLabelCheckboxComponent;
  let fixture: ComponentFixture<SideLabelCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideLabelCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideLabelCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
