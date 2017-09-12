import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagePluginDiscoveryComponent } from './page-plugin-discovery.component';

describe('PagePluginDiscoveryComponent', () => {
  let component: PagePluginDiscoveryComponent;
  let fixture: ComponentFixture<PagePluginDiscoveryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagePluginDiscoveryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagePluginDiscoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
