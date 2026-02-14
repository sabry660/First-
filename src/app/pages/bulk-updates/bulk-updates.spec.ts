import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUpdates } from './bulk-updates';

describe('BulkUpdates', () => {
  let component: BulkUpdates;
  let fixture: ComponentFixture<BulkUpdates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkUpdates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkUpdates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
