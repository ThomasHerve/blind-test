import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginDialog } from './login-dialog';

describe('LoginDialog', () => {
  let component: LoginDialog;
  let fixture: ComponentFixture<LoginDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
