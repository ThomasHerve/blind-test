import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFolderDialog } from './add-folder-dialog';

describe('AddFolderDialog', () => {
  let component: AddFolderDialog;
  let fixture: ComponentFixture<AddFolderDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFolderDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFolderDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
