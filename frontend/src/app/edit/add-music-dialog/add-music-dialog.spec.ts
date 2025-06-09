import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMusicDialog } from './add-music-dialog';

describe('AddMusicDialog', () => {
  let component: AddMusicDialog;
  let fixture: ComponentFixture<AddMusicDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMusicDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMusicDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
