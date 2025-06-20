import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratorDialog } from './collaborator-dialog';

describe('CollaboratorDialog', () => {
  let component: CollaboratorDialog;
  let fixture: ComponentFixture<CollaboratorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaboratorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollaboratorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
