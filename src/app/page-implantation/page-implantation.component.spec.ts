import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageImplantationComponent } from './page-implantation.component';

describe('PageImplantationComponent', () => {
  let component: PageImplantationComponent;
  let fixture: ComponentFixture<PageImplantationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageImplantationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageImplantationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
