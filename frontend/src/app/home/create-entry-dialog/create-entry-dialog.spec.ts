import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEntryDialog } from './create-entry-dialog';

describe('CreateEntryDialog', () => {
  let component: CreateEntryDialog;
  let fixture: ComponentFixture<CreateEntryDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEntryDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEntryDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
