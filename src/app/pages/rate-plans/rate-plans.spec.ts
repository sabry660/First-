import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatePlans } from './rate-plans';

describe('RatePlans', () => {
  let component: RatePlans;
  let fixture: ComponentFixture<RatePlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatePlans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatePlans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
