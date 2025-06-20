import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEntryDialog } from './delete-entry-dialog';

describe('DeleteEntryDialog', () => {
  let component: DeleteEntryDialog;
  let fixture: ComponentFixture<DeleteEntryDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteEntryDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteEntryDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
